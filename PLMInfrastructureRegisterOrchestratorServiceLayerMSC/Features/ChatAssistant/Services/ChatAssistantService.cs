using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Helpers;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Services
{
    // Q&A over Groq's OpenAI-compatible "Responses API", with conversation
    // memory (prior turns resent via Input) and data-awareness via tool
    // calling. Registered as an IHttpClientFactory typed client (see
    // Program.cs's AddHttpClient<ChatAssistantService>()) so HttpClient is
    // DI-managed rather than constructed directly, avoiding socket
    // exhaustion.
    //
    // This used to inject the FULL Resources + EnvironmentOverview dataset
    // into Instructions on every call instead of using tools - simpler, and
    // fine for 104 rows of data in isolation, but it broke in real testing:
    // Groq returned HTTP 413 on the very first real question. The actual
    // cause (confirmed by binary-searching payload sizes directly against
    // the live API and reading its own rate-limit response headers): this
    // account's Groq plan caps at 8000 tokens/minute, and the dataset alone
    // serializes to ~16K tokens even after stripping null fields - over
    // double the entire budget before any conversation or output. Tool
    // calling fixes this at the source: Instructions stays a small static
    // string, and real data is only fetched (and only the relevant slice of
    // it) on the turns that actually need it.
    public sealed class ChatAssistantService
    {
        private const string GroqResponsesEndpointURL = "https://api.groq.com/openai/v1/responses";
        private const string GroqModel = "openai/gpt-oss-20b";

        // Conversation history sent back to Groq on every question is capped
        // to this many of the most recent messages (not the whole
        // conversation, howerver long it's grown) - keeps token cost bounded
        // on a long-running chat without needing real summarization/windowing
        // logic for a first pass.
        private const int MaxHistoryMessages = 20;

        // Safety valve against a runaway tool-calling loop (a model that
        // keeps calling tools and never settles on a final answer) - Groq's
        // Responses API has no previous_response_id support (confirmed
        // live), so each round-trip resends the whole Input array rather
        // than this being an unbounded server-side chain.
        private const int MaxToolCallRoundTrips = 5;

        // query_resources' real-data safety caps. Confirmed live that the
        // actual constraint isn't just the 8000-tokens/minute aggregate -
        // Groq also rejects any SINGLE request whose own estimated tokens
        // exceed that ceiling with an immediate 413, regardless of
        // remaining budget (distinct from a 429, which means "this would
        // normally fit, you're just temporarily over budget"). 25 full
        // ~55-column rows (~18KB) combined with conversation history was
        // enough on its own to trip that on a follow-up question. So: a
        // SMALL result set (narrow enough that the user is plausibly asking
        // about specific machines) stays full detail; a LARGER one switches
        // to a compact per-row projection so a "list everything in prod"
        // question stays small regardless of how many rows match.
        private const int FullDetailRowThreshold = 5;
        private const int CompactRowCap = 30;

        // The one tool whose call can never resolve synchronously within
        // this loop - every other tool is a data lookup the backend can
        // answer immediately; this one needs a real human. See this class's
        // own top comment and RunGroqConversationLoopAsynchronous for how
        // that pause/resume actually works.
        private const string AskClarifyingQuestionToolName = "ask_clarifying_question";

        private readonly HttpClient _httpClient;
        private readonly ApplicationDatabaseContext _applicationDatabaseContext;
        private readonly ResourcesService _resourcesService;
        private readonly EnvironmentOverviewService _environmentOverviewService;

        public ChatAssistantService(
            HttpClient httpClient,
            ApplicationDatabaseContext applicationDatabaseContext,
            ResourcesService resourcesService,
            EnvironmentOverviewService environmentOverviewService)
        {
            _httpClient = httpClient;
            _applicationDatabaseContext = applicationDatabaseContext;
            _resourcesService = resourcesService;
            _environmentOverviewService = environmentOverviewService;
        }

        public async Task<AskQuestionResponseDTO> AskQuestionAsynchronous(
            string clientId, Guid? conversationId, string question)
        {
            ChatConversationNexus conversation = await ResolveOrCreateConversationAsynchronous(clientId, conversationId, question);

            List<ChatMessageNexus> history = await _applicationDatabaseContext.ChatMessages
                .Where(message => message.ConversationId == conversation.Id)
                .OrderBy(message => message.CreatedAt)
                .ToListAsync();

            // Holds a mix of item shapes once a tool call happens - see
            // GroqRequestDTO.Input's own comment for why this is List<object>
            // rather than a single strongly-typed list.
            List<object> inputItems = history
                .TakeLast(MaxHistoryMessages)
                .Select(message => (object)new GroqInputMessageDTO { Role = message.Role, Content = message.Text })
                .ToList();
            inputItems.Add(new GroqInputMessageDTO { Role = "user", Content = question });

            GroqConversationLoopResultDTO loopResult = await RunGroqConversationLoopAsynchronous(inputItems);

            DateTime now = DateTime.UtcNow;

            if (loopResult.PendingToolCallId is not null)
            {
                // Paused mid-turn - the normal end-of-method save below never
                // runs for a paused turn, so the originally-incoming
                // question (never saved yet) has to be persisted here too,
                // alongside the new pending-question row.
                Guid pendingMessageId = Guid.NewGuid();
                ClarifyingQuestionDTO pendingQuestion = PersistPendingQuestionAndBuildDTO(
                    conversation.Id, pendingMessageId, loopResult, now);

                _applicationDatabaseContext.ChatMessages.Add(
                    new ChatMessageNexus { Id = Guid.NewGuid(), ConversationId = conversation.Id, Role = "user", Text = question, MessageKind = "Text", CreatedAt = now });
                conversation.UpdatedAt = now;
                await _applicationDatabaseContext.SaveChangesAsync();

                return new AskQuestionResponseDTO { ConversationId = conversation.Id, Answer = null, PendingQuestion = pendingQuestion };
            }

            string answer = loopResult.Answer ?? "I wasn't able to come up with an answer to that.";

            _applicationDatabaseContext.ChatMessages.AddRange(
                new ChatMessageNexus { Id = Guid.NewGuid(), ConversationId = conversation.Id, Role = "user", Text = question, MessageKind = "Text", CreatedAt = now },
                new ChatMessageNexus { Id = Guid.NewGuid(), ConversationId = conversation.Id, Role = "assistant", Text = answer, MessageKind = "Text", CreatedAt = now }
            );
            conversation.UpdatedAt = now;

            await _applicationDatabaseContext.SaveChangesAsync();

            return new AskQuestionResponseDTO { ConversationId = conversation.Id, Answer = answer, PendingQuestion = null };
        }

        // Resolves a pending ask_clarifying_question tool call once the user
        // has actually answered (or skipped) it - the one place a
        // previously-paused Groq turn gets resumed. See ChatMessageNexus's
        // own comments on MessageKind/ToolCallId/ToolCallArguments/
        // ToolCallOutput/PendingInputStateJson for what each column here is
        // for.
        public async Task<AskQuestionResponseDTO> AnswerQuestionAsynchronous(AnswerQuestionRequestDTO request)
        {
            ChatMessageNexus? pendingMessage = await _applicationDatabaseContext.ChatMessages
                .FirstOrDefaultAsync(message => message.Id == request.MessageId && message.ConversationId == request.ConversationId);

            if (pendingMessage is null)
            {
                throw new NotFoundException("That question could not be found.");
            }

            if (pendingMessage.MessageKind != "ClarifyingQuestion" || pendingMessage.ToolCallOutput is not null)
            {
                throw new ValidationException("That question is not awaiting an answer.");
            }

            ChatConversationNexus? conversation = await _applicationDatabaseContext.ChatConversations
                .FirstOrDefaultAsync(existing => existing.Id == request.ConversationId);

            if (conversation is null)
            {
                throw new NotFoundException("That conversation could not be found.");
            }

            string outputJson = JsonSerializer.Serialize(new
            {
                selectedOptions = request.SelectedOptions,
                freeTextAnswer = request.FreeTextAnswer,
                skipped = request.IsSkipped,
            });

            pendingMessage.ToolCallOutput = outputJson;
            pendingMessage.IsSkipped = request.IsSkipped;

            // Rehydrated as JsonElement rather than back into the original
            // DTO types - System.Text.Json serializes a boxed JsonElement
            // exactly as it deserialized it, so appending the two freshly-
            // built DTOs below onto this list serializes correctly with no
            // manual re-typing needed.
            List<JsonElement> rehydratedItems = JsonSerializer.Deserialize<List<JsonElement>>(
                pendingMessage.PendingInputStateJson ?? "[]") ?? new List<JsonElement>();
            List<object> inputItems = rehydratedItems.Cast<object>().ToList();

            inputItems.Add(new GroqFunctionCallItemDTO
            {
                CallId = pendingMessage.ToolCallId ?? string.Empty,
                Name = AskClarifyingQuestionToolName,
                Arguments = pendingMessage.ToolCallArguments ?? "{}",
            });
            inputItems.Add(new GroqFunctionCallOutputItemDTO
            {
                CallId = pendingMessage.ToolCallId ?? string.Empty,
                Output = outputJson,
            });

            GroqConversationLoopResultDTO loopResult = await RunGroqConversationLoopAsynchronous(inputItems);

            DateTime now = DateTime.UtcNow;

            if (loopResult.PendingToolCallId is not null)
            {
                Guid newPendingMessageId = Guid.NewGuid();
                ClarifyingQuestionDTO pendingQuestion = PersistPendingQuestionAndBuildDTO(
                    conversation.Id, newPendingMessageId, loopResult, now);

                conversation.UpdatedAt = now;
                await _applicationDatabaseContext.SaveChangesAsync();

                return new AskQuestionResponseDTO { ConversationId = conversation.Id, Answer = null, PendingQuestion = pendingQuestion };
            }

            string answer = loopResult.Answer ?? "I wasn't able to come up with an answer to that.";

            _applicationDatabaseContext.ChatMessages.Add(
                new ChatMessageNexus { Id = Guid.NewGuid(), ConversationId = conversation.Id, Role = "assistant", Text = answer, MessageKind = "Text", CreatedAt = now });
            conversation.UpdatedAt = now;

            await _applicationDatabaseContext.SaveChangesAsync();

            return new AskQuestionResponseDTO { ConversationId = conversation.Id, Answer = answer, PendingQuestion = null };
        }

        // Shared by AskQuestionAsynchronous (fresh inputItems built from
        // history) and AnswerQuestionAsynchronous (rehydrated inputItems
        // from a resumed pause) - the exact same round-trip loop either way,
        // ending in either a final text answer or a NEW pause (resuming a
        // paused turn can itself immediately hit another clarifying
        // question). Does not persist anything itself - callers decide what
        // to save since the "also save the original question" step only
        // applies to a fresh AskQuestionAsynchronous call.
        private async Task<GroqConversationLoopResultDTO> RunGroqConversationLoopAsynchronous(List<object> inputItems)
        {
            string groqApiKey = ENValidatorHelper.Current.GetEnvKeyValue("GROQ_API_KEY");

            for (int roundTrip = 0; roundTrip < MaxToolCallRoundTrips; roundTrip++)
            {
                var groqRequest = new GroqRequestDTO
                {
                    Model = GroqModel,
                    Instructions = AssistantInstructions,
                    Input = inputItems,
                    Tools = ToolDefinitions,
                };

                using var httpRequestMessage = new HttpRequestMessage(HttpMethod.Post, GroqResponsesEndpointURL)
                {
                    Content = JsonContent.Create(groqRequest),
                };
                httpRequestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", groqApiKey);

                using HttpResponseMessage httpResponseMessage = await _httpClient.SendAsync(httpRequestMessage);

                if (!httpResponseMessage.IsSuccessStatusCode)
                {
                    string errorBody = await httpResponseMessage.Content.ReadAsStringAsync();
                    throw new InvalidOperationException(
                        $"The assistant service responded with an unexpected status code ({(int)httpResponseMessage.StatusCode}): {errorBody}");
                }

                GroqResponseDTO? groqResponse = await httpResponseMessage.Content.ReadFromJsonAsync<GroqResponseDTO>();
                List<GroqResponseOutputItemDTO> outputItems = groqResponse?.Output ?? new List<GroqResponseOutputItemDTO>();

                List<GroqResponseOutputItemDTO> functionCalls = outputItems
                    .Where(outputItem => outputItem.Type == "function_call")
                    .ToList();

                if (functionCalls.Count == 0)
                {
                    string? answer = outputItems
                        .Where(outputItem => outputItem.Type == "message")
                        .SelectMany(outputItem => outputItem.Content ?? new List<GroqResponseContentItemDTO>())
                        .Where(contentItem => contentItem.Type == "output_text")
                        .Select(contentItem => contentItem.Text)
                        .FirstOrDefault(text => !string.IsNullOrWhiteSpace(text));

                    return new GroqConversationLoopResultDTO { Answer = answer };
                }

                foreach (GroqResponseOutputItemDTO functionCall in functionCalls)
                {
                    string callId = functionCall.CallId ?? string.Empty;
                    string toolName = functionCall.Name ?? string.Empty;
                    string argumentsJson = functionCall.Arguments ?? "{}";

                    if (toolName == AskClarifyingQuestionToolName)
                    {
                        // Snapshotted BEFORE this call's own pair is added -
                        // this is exactly the state AnswerQuestionAsynchronous
                        // needs to rehydrate and resume from later. Any OTHER
                        // tool calls already resolved earlier in this SAME
                        // batch/round-trip are already reflected in
                        // inputItems by this point, so they're preserved
                        // (only this one pauses, siblings still resolve
                        // normally).
                        return new GroqConversationLoopResultDTO
                        {
                            PendingToolCallId = callId,
                            PendingToolCallArguments = argumentsJson,
                            InputItemsBeforePendingCall = new List<object>(inputItems),
                        };
                    }

                    inputItems.Add(new GroqFunctionCallItemDTO
                    {
                        CallId = callId,
                        Name = toolName,
                        Arguments = argumentsJson,
                    });

                    string toolResultJson = await ExecuteToolCallAsynchronous(toolName, argumentsJson);

                    inputItems.Add(new GroqFunctionCallOutputItemDTO
                    {
                        CallId = callId,
                        Output = toolResultJson,
                    });
                }
            }

            return new GroqConversationLoopResultDTO { Answer = "I wasn't able to find an answer within the allowed number of lookups." };
        }

        // Shared by the two "we just paused" branches above (a fresh
        // question pausing immediately, and a resumed question pausing
        // again) - builds the new ChatMessageNexus row (added to the
        // context, not yet saved) and the matching DTO the controller
        // returns to the frontend.
        private ClarifyingQuestionDTO PersistPendingQuestionAndBuildDTO(
            Guid conversationId, Guid pendingMessageId, GroqConversationLoopResultDTO loopResult, DateTime now)
        {
            AskClarifyingQuestionArgsDTO args = JsonSerializer.Deserialize<AskClarifyingQuestionArgsDTO>(
                loopResult.PendingToolCallArguments!, ArgsParsingOptions) ?? new AskClarifyingQuestionArgsDTO();

            _applicationDatabaseContext.ChatMessages.Add(new ChatMessageNexus
            {
                Id = pendingMessageId,
                ConversationId = conversationId,
                Role = "assistant",
                // Plain-text fallback - also what a LATER, unrelated
                // /AskQuestion call in this same conversation replays back
                // to Groq as this row's own history turn (see
                // AskQuestionAsynchronous's history-mapping), so this needs
                // to stay meaningful on its own, not just a UI nicety.
                Text = $"{args.Heading}: {args.Description}",
                MessageKind = "ClarifyingQuestion",
                ToolCallId = loopResult.PendingToolCallId,
                ToolCallArguments = loopResult.PendingToolCallArguments,
                ToolCallOutput = null,
                IsSkipped = false,
                PendingInputStateJson = JsonSerializer.Serialize(loopResult.InputItemsBeforePendingCall),
                CreatedAt = now,
            });

            return new ClarifyingQuestionDTO
            {
                MessageId = pendingMessageId,
                Heading = args.Heading,
                Description = args.Description,
                Options = args.Options,
                AllowMultiple = args.AllowMultiple,
            };
        }

        // RunGroqConversationLoopAsynchronous's own return shape - exactly
        // one of (Answer) or (PendingToolCallId + PendingToolCallArguments +
        // InputItemsBeforePendingCall) is populated.
        private sealed class GroqConversationLoopResultDTO
        {
            public string? Answer { get; set; }

            public string? PendingToolCallId { get; set; }

            public string? PendingToolCallArguments { get; set; }

            public List<object>? InputItemsBeforePendingCall { get; set; }
        }

        public async Task<List<ChatConversationSummaryDTO>> GetConversationsAsynchronous(string clientId)
        {
            return await _applicationDatabaseContext.ChatConversations
                .AsNoTracking()
                .Where(conversation => conversation.AnonymousClientId == clientId)
                .OrderByDescending(conversation => conversation.UpdatedAt)
                .Select(conversation => new ChatConversationSummaryDTO
                {
                    Id = conversation.Id,
                    Title = conversation.Title,
                    UpdatedAt = conversation.UpdatedAt,
                })
                .ToListAsync();
        }

        public async Task<List<ChatMessageDTO>> GetConversationMessagesAsynchronous(Guid conversationId)
        {
            bool conversationExists = await _applicationDatabaseContext.ChatConversations
                .AnyAsync(conversation => conversation.Id == conversationId);

            if (!conversationExists)
            {
                throw new NotFoundException("That conversation could not be found.");
            }

            return await _applicationDatabaseContext.ChatMessages
                .AsNoTracking()
                .Where(message => message.ConversationId == conversationId)
                .OrderBy(message => message.CreatedAt)
                .Select(message => new ChatMessageDTO
                {
                    Id = message.Id,
                    Role = message.Role,
                    Text = message.Text,
                    CreatedAt = message.CreatedAt,
                    MessageKind = message.MessageKind,
                    ToolCallArguments = message.ToolCallArguments,
                    ToolCallOutput = message.ToolCallOutput,
                    IsSkipped = message.IsSkipped,
                })
                .ToListAsync();
        }

        private async Task<ChatConversationNexus> ResolveOrCreateConversationAsynchronous(
            string clientId, Guid? conversationId, string question)
        {
            if (conversationId.HasValue)
            {
                ChatConversationNexus? existing = await _applicationDatabaseContext.ChatConversations
                    .FirstOrDefaultAsync(conversation => conversation.Id == conversationId.Value);

                if (existing is not null) return existing;
            }

            // Either no conversationId was given (brand new chat) or the one
            // given no longer exists - either way, start a fresh conversation
            // rather than failing the question outright.
            const int maxTitleLength = 60;
            string trimmedQuestion = question.Trim();
            string title = trimmedQuestion.Length > maxTitleLength
                ? trimmedQuestion[..maxTitleLength].TrimEnd() + "…"
                : trimmedQuestion;

            var newConversation = new ChatConversationNexus
            {
                Id = Guid.NewGuid(),
                AnonymousClientId = clientId,
                Title = title,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            _applicationDatabaseContext.ChatConversations.Add(newConversation);
            return newConversation;
        }

        // The assistant's only source of app-specific knowledge beyond this
        // static description is whatever its tools return - deliberately no
        // data baked in here (see this class's own top comment for why).
        private const string AssistantInstructions =
            "You are the AI assistant embedded in InfraGrid, an internal infrastructure register for Azure " +
            "virtual machines and environments. You have tools to look up live Resources and Environment " +
            "Overview data - call them whenever a question needs real data; never guess or make up values. " +
            "Dates are ISO 8601. A missing/null field means that value isn't recorded for that row. If a " +
            "tool result says it was truncated, tell the user and suggest narrowing the question (e.g. by " +
            "environment or hostname) instead of presenting it as complete. " +
            "Answer in rich Markdown, not plain prose - the UI renders it with real styling (headings, " +
            "tables, bold, lists, etc.), so lean into using these visual components wherever they make an " +
            "answer clearer: Markdown tables for any list of resources/rows, headings (##/###) to break up " +
            "a longer answer into sections, bold for key values the user is likely scanning for, and " +
            "bullet/numbered lists for steps or multiple distinct points. Don't force these onto a short, " +
            "single-fact answer that reads better as one plain sentence. " +
            "If a request is genuinely ambiguous or needs a judgment call only the user can make - not " +
            "something answerable via the data tools - call ask_clarifying_question instead of asking " +
            "inline in your own prose; it renders as a real interactive widget, so don't also restate the " +
            "question in text. Give it a short heading (a few words, not a full sentence) plus a separate " +
            "plain-language description explaining what you're asking and why, so the heading alone doesn't " +
            "have to carry all the context. When you do offer options, keep the list short and generalized " +
            "(roughly 5-6 at most, never a raw enumeration of every literal possibility) - omit options " +
            "entirely for a question that only makes sense as free text. Ask at most one question per turn.";

        private static readonly List<GroqToolDefinitionDTO> ToolDefinitions = new()
        {
            new GroqToolDefinitionDTO
            {
                Name = "query_resources",
                Description =
                    "Look up Azure VM/resource rows, optionally filtered by environment tag and/or hostname " +
                    "(case-insensitive partial match on either). Returns up to 25 matching rows - check the " +
                    "'truncated' field in the result if more rows actually matched than were returned.",
                Parameters = new
                {
                    type = "object",
                    properties = new
                    {
                        environmentTag = new
                        {
                            // Confirmed live: the model sometimes passes a
                            // literal null for an optional argument it isn't
                            // using (rather than omitting it entirely), which
                            // Groq's own schema validator rejects against a
                            // single-typed "string" - allowing null here is
                            // what the actual argument space really is, not
                            // a looser contract than intended.
                            type = new[] { "string", "null" },
                            description = "Partial, case-insensitive match against the resource's environment tag, e.g. \"Production\".",
                        },
                        hostname = new
                        {
                            type = new[] { "string", "null" },
                            description = "Partial, case-insensitive match against the resource's hostname.",
                        },
                    },
                    required = Array.Empty<string>(),
                },
            },
            new GroqToolDefinitionDTO
            {
                Name = "query_environment_overview",
                Description =
                    "Look up logical environment rows (Environment, Purpose, Sponsor, CurrentUptimeSchedule, " +
                    "Priority1-3, Status, etc.), optionally filtered by environment name (case-insensitive " +
                    "partial match). Does NOT include the ActionItemsUpdates field - use " +
                    "get_environment_action_items for that.",
                Parameters = new
                {
                    type = "object",
                    properties = new
                    {
                        environment = new
                        {
                            // Same nullable-optional-argument fix as
                            // query_resources above.
                            type = new[] { "string", "null" },
                            description = "Partial, case-insensitive match against the environment's name, e.g. \"Production\".",
                        },
                    },
                    required = Array.Empty<string>(),
                },
            },
            new GroqToolDefinitionDTO
            {
                Name = "get_environment_action_items",
                Description =
                    "Get the ActionItemsUpdates free-text field for one specific environment (an ongoing log " +
                    "of action items/updates for that environment). Requires the environment's name; if more " +
                    "than one environment matches, returns the list of matches instead so you can ask which " +
                    "one was meant.",
                Parameters = new
                {
                    type = "object",
                    properties = new
                    {
                        environment = new
                        {
                            type = "string",
                            description = "The environment's name, e.g. \"Production\". Partial, case-insensitive match.",
                        },
                    },
                    required = new[] { "environment" },
                },
            },
            new GroqToolDefinitionDTO
            {
                Name = AskClarifyingQuestionToolName,
                Description =
                    "Ask the user a single clarifying question when their request is genuinely ambiguous or " +
                    "needs a judgment call only they can make - not for anything answerable via the other " +
                    "tools. Renders as a real interactive widget, not plain text - do not also restate the " +
                    "question in your own prose answer.",
                Parameters = new
                {
                    type = "object",
                    properties = new
                    {
                        heading = new
                        {
                            type = "string",
                            description = "A short title for the question card, e.g. \"Which environment?\" - a few words, not a full sentence.",
                        },
                        description = new
                        {
                            type = "string",
                            description =
                                "A plain-language explanation of what you're asking and why, shown muted " +
                                "beneath the heading - give the user enough context to answer confidently " +
                                "without the heading alone having to carry it.",
                        },
                        options = new
                        {
                            type = "array",
                            items = new { type = "string" },
                            description =
                                "Optional. A short, focused list of concrete choices - roughly 5-6 at most, " +
                                "generalized rather than an exhaustive enumeration. Omit entirely for a " +
                                "question that only makes sense as free text.",
                        },
                        allowMultiple = new
                        {
                            type = "boolean",
                            description = "Whether the user may select more than one option. Ignored if 'options' is omitted.",
                        },
                    },
                    required = new[] { "heading", "description" },
                },
            },
        };

        // Omitting null-valued fields cuts the serialized payload roughly
        // in half (confirmed against the real dataset - most Resources rows
        // leave many optional columns unset); the enum converter keeps
        // Status human-readable (e.g. "Active") rather than a bare integer,
        // which matters now that tool results are read directly to answer
        // factual questions.
        private static readonly JsonSerializerOptions ToolResultSerializerOptions = new()
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            Converters = { new JsonStringEnumConverter() },
        };

        private static readonly JsonSerializerOptions ArgsParsingOptions = new()
        {
            PropertyNameCaseInsensitive = true,
        };

        private async Task<string> ExecuteToolCallAsynchronous(string toolName, string argumentsJson)
        {
            switch (toolName)
            {
                case "query_resources":
                {
                    var args = JsonSerializer.Deserialize<QueryResourcesArgsDTO>(argumentsJson, ArgsParsingOptions)
                        ?? new QueryResourcesArgsDTO();
                    return await ExecuteQueryResourcesAsynchronous(args.EnvironmentTag, args.Hostname);
                }
                case "query_environment_overview":
                {
                    var args = JsonSerializer.Deserialize<QueryEnvironmentOverviewArgsDTO>(argumentsJson, ArgsParsingOptions)
                        ?? new QueryEnvironmentOverviewArgsDTO();
                    return await ExecuteQueryEnvironmentOverviewAsynchronous(args.Environment);
                }
                case "get_environment_action_items":
                {
                    var args = JsonSerializer.Deserialize<GetEnvironmentActionItemsArgsDTO>(argumentsJson, ArgsParsingOptions)
                        ?? new GetEnvironmentActionItemsArgsDTO();
                    return await ExecuteGetEnvironmentActionItemsAsynchronous(args.Environment);
                }
                default:
                    return JsonSerializer.Serialize(new { error = $"Unknown tool '{toolName}'." });
            }
        }

        private async Task<string> ExecuteQueryResourcesAsynchronous(string? environmentTag, string? hostname)
        {
            List<ResourceNexus> allResources = await _resourcesService.GetAllResourcesAsynchronous();

            IEnumerable<ResourceNexus> filtered = allResources;
            if (!string.IsNullOrWhiteSpace(environmentTag))
            {
                filtered = filtered.Where(resource =>
                    resource.EnvironmentTag is not null &&
                    resource.EnvironmentTag.Contains(environmentTag, StringComparison.OrdinalIgnoreCase));
            }
            if (!string.IsNullOrWhiteSpace(hostname))
            {
                filtered = filtered.Where(resource =>
                    resource.Hostname.Contains(hostname, StringComparison.OrdinalIgnoreCase));
            }

            List<ResourceNexus> matched = filtered.ToList();

            if (matched.Count <= FullDetailRowThreshold)
            {
                return JsonSerializer.Serialize(new
                {
                    totalMatching = matched.Count,
                    truncated = false,
                    resources = matched,
                }, ToolResultSerializerOptions);
            }

            bool truncated = matched.Count > CompactRowCap;
            var compactPage = matched
                .Take(CompactRowCap)
                .Select(resource => new
                {
                    resource.Hostname,
                    resource.EnvironmentTag,
                    resource.Status,
                    resource.OperatingSystem,
                    resource.Size,
                    resource.CpuCores,
                    resource.RamGB,
                    resource.Function,
                    resource.ResourceGroup,
                    resource.Subscription,
                    resource.Location,
                })
                .ToList();

            return JsonSerializer.Serialize(new
            {
                totalMatching = matched.Count,
                truncated,
                note = "This is a compact view (fewer columns) because many rows matched. Narrow the question (e.g. add a hostname) for full column detail on specific machines.",
                resources = compactPage,
            }, ToolResultSerializerOptions);
        }

        private async Task<string> ExecuteQueryEnvironmentOverviewAsynchronous(string? environment)
        {
            List<EnvironmentOverviewDTO> allEnvironments = await _environmentOverviewService.GetEnvironmentOverviewsAsynchronous();

            IEnumerable<EnvironmentOverviewDTO> filtered = allEnvironments;
            if (!string.IsNullOrWhiteSpace(environment))
            {
                filtered = filtered.Where(environmentRow =>
                    environmentRow.Environment.Contains(environment, StringComparison.OrdinalIgnoreCase));
            }

            var projected = filtered.Select(environmentRow => new
            {
                environmentRow.Id,
                environmentRow.Environment,
                environmentRow.Purpose,
                environmentRow.Sponsor,
                environmentRow.CurrentUptimeSchedule,
                environmentRow.Priority1,
                environmentRow.Priority2,
                environmentRow.Priority3,
                environmentRow.ConfigurationCustomisationVersion,
                environmentRow.DNSURL,
                environmentRow.Status,
            }).ToList();

            return JsonSerializer.Serialize(new { environments = projected }, ToolResultSerializerOptions);
        }

        private async Task<string> ExecuteGetEnvironmentActionItemsAsynchronous(string? environment)
        {
            if (string.IsNullOrWhiteSpace(environment))
            {
                return JsonSerializer.Serialize(new { error = "An 'environment' value is required." });
            }

            List<EnvironmentOverviewDTO> allEnvironments = await _environmentOverviewService.GetEnvironmentOverviewsAsynchronous();

            // An exact (case-insensitive) match always wins outright, even
            // when it's also a *substring* of other rows' names - e.g.
            // "Production" is literally contained in "Production Data
            // Migration" and "DevOps Production" too, so partial-match-only
            // logic could never resolve the ambiguity no matter what exact
            // name is given (confirmed live: the model kept re-asking
            // forever since "Production" always partial-matched all three).
            EnvironmentOverviewDTO? exactMatch = allEnvironments
                .FirstOrDefault(environmentRow => string.Equals(environmentRow.Environment, environment, StringComparison.OrdinalIgnoreCase));

            List<EnvironmentOverviewDTO> matches = exactMatch is not null
                ? new List<EnvironmentOverviewDTO> { exactMatch }
                : allEnvironments
                    .Where(environmentRow => environmentRow.Environment.Contains(environment, StringComparison.OrdinalIgnoreCase))
                    .ToList();

            if (matches.Count == 0)
            {
                return JsonSerializer.Serialize(new { error = $"No environment matching '{environment}' was found." });
            }

            if (matches.Count > 1)
            {
                return JsonSerializer.Serialize(new
                {
                    ambiguous = true,
                    matchingEnvironments = matches.Select(environmentRow => environmentRow.Environment).ToList(),
                });
            }

            EnvironmentOverviewDTO match = matches[0];
            return JsonSerializer.Serialize(new
            {
                environment = match.Environment,
                actionItemsUpdates = match.ActionItemsUpdates,
            }, ToolResultSerializerOptions);
        }

        private sealed class QueryResourcesArgsDTO
        {
            public string? EnvironmentTag { get; set; }
            public string? Hostname { get; set; }
        }

        private sealed class QueryEnvironmentOverviewArgsDTO
        {
            public string? Environment { get; set; }
        }

        private sealed class GetEnvironmentActionItemsArgsDTO
        {
            public string? Environment { get; set; }
        }
    }
}
