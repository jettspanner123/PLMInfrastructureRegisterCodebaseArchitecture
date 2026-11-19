using System.Globalization;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Jira.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Helpers;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Utilities;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Jira.Services
{
    // Creates the single Jira ticket this app ever creates: a sub-task for
    // a new Uptime Request, parented to one fixed Epic. Registered as an
    // IHttpClientFactory typed client (see Program.cs's
    // AddHttpClient<JiraService>()) - same DI-managed-HttpClient pattern
    // ChatAssistantService already uses for Groq, so HttpClient lifetime
    // isn't hand-managed here either.
    //
    // Never throws for a Jira-side rejection or a connection-level failure
    // - both come back as an ordinary JiraTicketCreationResultModel with
    // IsSuccess = false, so the caller (EnvironmentUptimeRequestsService)
    // decides how to log and propagate the failure. See research.md §7 and
    // §8 in specs/002-jira-ticket-creation for why.
    public sealed class JiraService
    {
        private readonly HttpClient _httpClient;

        public JiraService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // Deliberately NOT read in the constructor: JiraService is
        // constructed by DI every time EnvironmentUptimeRequestsService is
        // (an AddHttpClient<T> typed client is built per-scope regardless
        // of which of that service's methods actually runs) - reading
        // required env vars there would make EVERY Uptime Request endpoint
        // (including plain reads) fail the moment Jira isn't configured,
        // not just ticket creation. Read lazily, here, the one time they're
        // actually needed - and folded into the same "couldn't create the
        // ticket" failure path as any other Jira problem if missing, rather
        // than an uncaught exception.
        public async Task<JiraTicketCreationResultModel> CreateUptimeRequestTicketAsynchronous(
            string ticketId,
            string environment,
            string requesterName,
            string requesterEmail,
            DateTime fromAtUtc,
            DateTime toAtUtc,
            string? message)
        {
            string summary = $"Uptime Request - {environment} - {requesterName}";

            string baseUrl;
            string projectKey;
            string parentEpicKey;
            string issueType;

            try
            {
                baseUrl = ENValidatorHelper.Current.GetEnvKeyValue("JIRA_BASE_URL").TrimEnd('/');
                string email = ENValidatorHelper.Current.GetEnvKeyValue("JIRA_EMAIL");
                string apiToken = ENValidatorHelper.Current.GetEnvKeyValue("JIRA_API_TOKEN");
                projectKey = ENValidatorHelper.Current.GetEnvKeyValue("JIRA_PROJECT_KEY");
                parentEpicKey = ENValidatorHelper.Current.GetEnvKeyValue("JIRA_PARENT_EPIC_KEY");
                issueType = ENValidatorHelper.Current.GetEnvKeyValue("JIRA_ISSUE_TYPE");

                _httpClient.BaseAddress = new Uri(baseUrl);

                // Jira Cloud's Basic Auth scheme: base64(email:apiToken) -
                // not a bearer token. Confirmed with the user this is
                // Cloud, not Server/Data Center (which would use a Bearer
                // PAT instead).
                string basicAuthValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{email}:{apiToken}"));
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", basicAuthValue);
            }
            catch (ENKeyNotFoundException ex)
            {
                return new JiraTicketCreationResultModel
                {
                    IsSuccess = false,
                    AttemptedSummary = summary,
                    AttemptedDescription = string.Empty,
                    FailureReason = $"Jira is not configured on this server: {ex.Message}",
                    StatusCode = null,
                    ResponseBody = null,
                };
            }

            List<string> descriptionLines = new()
            {
                $"Uptime Request: {ticketId}",
                $"Requester: {requesterName} ({requesterEmail})",
                $"Environment: {environment}",
                $"From: {FormatCetDisplay(fromAtUtc)}",
                $"To: {FormatCetDisplay(toAtUtc)}",
            };
            if (!string.IsNullOrWhiteSpace(message))
            {
                descriptionLines.Add($"Message: {message}");
            }

            string plainDescription = string.Join("\n", descriptionLines);

            // Jira API v3 requires the Atlassian Document Format for
            // `description` - a plain string is rejected. One paragraph per
            // line above.
            var requestBody = new
            {
                fields = new
                {
                    project = new { key = projectKey },
                    issuetype = new { name = issueType },
                    parent = new { key = parentEpicKey },
                    summary,
                    description = new
                    {
                        type = "doc",
                        version = 1,
                        content = descriptionLines.Select(line => new
                        {
                            type = "paragraph",
                            content = new[] { new { type = "text", text = line } },
                        }),
                    },
                },
            };

            try
            {
                using HttpResponseMessage response = await _httpClient.PostAsJsonAsync("/rest/api/3/issue", requestBody);
                string responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return new JiraTicketCreationResultModel
                    {
                        IsSuccess = false,
                        AttemptedSummary = summary,
                        AttemptedDescription = plainDescription,
                        FailureReason = $"Jira returned HTTP {(int)response.StatusCode}.",
                        StatusCode = (int)response.StatusCode,
                        ResponseBody = responseBody,
                    };
                }

                JiraCreateIssueResponseDTO? parsed = JsonSerializer.Deserialize<JiraCreateIssueResponseDTO>(
                    responseBody, JsonSerializerOptionsInstance);

                if (parsed is null || string.IsNullOrWhiteSpace(parsed.Key))
                {
                    return new JiraTicketCreationResultModel
                    {
                        IsSuccess = false,
                        AttemptedSummary = summary,
                        AttemptedDescription = plainDescription,
                        FailureReason = "Jira responded successfully but did not return a ticket key.",
                        StatusCode = (int)response.StatusCode,
                        ResponseBody = responseBody,
                    };
                }

                List<JiraEnrichmentFailureModel> enrichmentFailures = await SetEnrichmentFieldsAsync(parsed.Key);

                return new JiraTicketCreationResultModel
                {
                    IsSuccess = true,
                    AttemptedSummary = summary,
                    AttemptedDescription = plainDescription,
                    TicketKey = parsed.Key,
                    TicketUrl = $"{baseUrl}/browse/{parsed.Key}",
                    EnrichmentFailures = enrichmentFailures,
                };
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                return new JiraTicketCreationResultModel
                {
                    IsSuccess = false,
                    AttemptedSummary = summary,
                    AttemptedDescription = plainDescription,
                    FailureReason = $"Could not connect to Jira: {ex.Message}",
                    StatusCode = null,
                    ResponseBody = null,
                };
            }
        }

        // Runs after the ticket already exists - Assignee and Story Points
        // are enrichment, not required for the ticket itself, so each is
        // attempted independently and a failure here never flips the
        // ticket's own IsSuccess (research.md §9). Missing/invalid config
        // for either is treated the same as a rejected Jira call: skipped,
        // and reported back as one more enrichment failure for the caller
        // to log.
        private async Task<List<JiraEnrichmentFailureModel>> SetEnrichmentFieldsAsync(string ticketKey)
        {
            List<JiraEnrichmentFailureModel> failures = new();

            if (ENValidatorHelper.Current.TryGetEnvKeyValue("JIRA_DEFAULT_ASSIGNEE_ACCOUNT_ID", out string? assigneeAccountId))
            {
                JiraEnrichmentFailureModel? assigneeFailure = await TrySetFieldAsync(
                    ticketKey,
                    "Assignee",
                    new Dictionary<string, object> { ["assignee"] = new { accountId = assigneeAccountId } });

                if (assigneeFailure is not null)
                {
                    failures.Add(assigneeFailure);
                }
            }
            else
            {
                failures.Add(new JiraEnrichmentFailureModel
                {
                    FieldName = "Assignee",
                    FailureReason = "JIRA_DEFAULT_ASSIGNEE_ACCOUNT_ID is not configured.",
                });
            }

            bool hasFieldId = ENValidatorHelper.Current.TryGetEnvKeyValue("JIRA_STORY_POINTS_FIELD_ID", out string? storyPointsFieldId);
            bool hasValue = ENValidatorHelper.Current.TryGetEnvKeyValue("JIRA_STORY_POINTS_VALUE", out string? storyPointsValueRaw);

            if (hasFieldId && hasValue && double.TryParse(storyPointsValueRaw, NumberStyles.Float, CultureInfo.InvariantCulture, out double storyPointsValue))
            {
                JiraEnrichmentFailureModel? storyPointsFailure = await TrySetFieldAsync(
                    ticketKey,
                    "Story Points",
                    new Dictionary<string, object> { [storyPointsFieldId!] = storyPointsValue });

                if (storyPointsFailure is not null)
                {
                    failures.Add(storyPointsFailure);
                }
            }
            else
            {
                failures.Add(new JiraEnrichmentFailureModel
                {
                    FieldName = "Story Points",
                    FailureReason = "JIRA_STORY_POINTS_FIELD_ID or JIRA_STORY_POINTS_VALUE is not configured or not a valid number.",
                });
            }

            return failures;
        }

        private async Task<JiraEnrichmentFailureModel?> TrySetFieldAsync(string ticketKey, string fieldName, Dictionary<string, object> fields)
        {
            try
            {
                using HttpResponseMessage response = await _httpClient.PutAsJsonAsync($"/rest/api/3/issue/{ticketKey}", new { fields });

                if (response.IsSuccessStatusCode)
                {
                    return null;
                }

                string responseBody = await response.Content.ReadAsStringAsync();

                return new JiraEnrichmentFailureModel
                {
                    FieldName = fieldName,
                    FailureReason = $"Jira returned HTTP {(int)response.StatusCode} when setting {fieldName}.",
                    StatusCode = (int)response.StatusCode,
                    ResponseBody = responseBody,
                };
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                return new JiraEnrichmentFailureModel
                {
                    FieldName = fieldName,
                    FailureReason = $"Could not connect to Jira when setting {fieldName}: {ex.Message}",
                };
            }
        }

        // CETTimeZoneUtility is deliberately conversion-only (UTC <-> CET) -
        // this display-formatting step stays local to the one caller that
        // needs it, same separation of concerns the frontend's own
        // CETDateTimeFormatUtility keeps from its conversion logic.
        private static string FormatCetDisplay(DateTime utcDateTime)
        {
            DateTime cetDateTime = CETTimeZoneUtility.FromUtc(utcDateTime);
            return $"{cetDateTime:MMM d, yyyy, h:mm tt} CET";
        }

        private static readonly JsonSerializerOptions JsonSerializerOptionsInstance = new()
        {
            PropertyNameCaseInsensitive = true,
        };

        private sealed class JiraCreateIssueResponseDTO
        {
            [JsonPropertyName("id")]
            public string? Id { get; set; }

            [JsonPropertyName("key")]
            public string? Key { get; set; }

            [JsonPropertyName("self")]
            public string? Self { get; set; }
        }
    }
}
