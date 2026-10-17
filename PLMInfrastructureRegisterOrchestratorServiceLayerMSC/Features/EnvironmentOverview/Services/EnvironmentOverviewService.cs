using System.Globalization;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Helpers;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Services
{
    public sealed class EnvironmentOverviewService
    {
        private readonly HttpClient _httpClient;
        private readonly ApplicationDatabaseContext _applicationDatabaseContext;

        // Groq config duplicated from ChatAssistantService rather than
        // shared, deliberately - this service's own Uptime Schedule note
        // summarization is a single, fully self-contained call (see
        // SummarizeUptimeScheduleNoteAsynchronous) with no other Groq
        // surface here, and ChatAssistantService already depends on THIS
        // service (for its query_environment_overview tool) - depending on
        // ChatAssistantService back would be circular.
        private const string GroqResponsesEndpointURL = "https://api.groq.com/openai/v1/responses";
        private const string GroqModel = "openai/gpt-oss-20b";

        // Below this length, a note is already short enough to show as its
        // own "summary" verbatim - no Groq call made at all.
        private const int NoteSummaryThresholdLength = 120;

        // If summarization fails (rate limit, network), falls back to a
        // plain truncation at this length (+ "…") instead - same "never let
        // a best-effort AI step block or break the actual save" philosophy
        // as ChatAssistantService's own title generation.
        private const int NoteSummaryFallbackTruncateLength = 117;

        public EnvironmentOverviewService(HttpClient httpClient, ApplicationDatabaseContext applicationDatabaseContext)
        {
            _httpClient = httpClient;
            _applicationDatabaseContext = applicationDatabaseContext;
        }

        public async Task<List<EnvironmentOverviewDTO>> GetEnvironmentOverviewsAsynchronous()
        {
            List<EnvironmentOverviewNexus> environments = await _applicationDatabaseContext
                .EnvironmentOverviews
                .AsNoTracking()
                .OrderBy(environment => environment.DisplayOrder)
                .ToListAsync();

            return environments
                .Select(environment => new EnvironmentOverviewDTO
                {
                    Id = environment.Id,
                    Environment = environment.Environment,
                    Purpose = environment.Purpose,
                    Sponsor = environment.Sponsor,
                    CurrentUptimeSchedule = environment.CurrentUptimeSchedule,
                    Priority1 = environment.Priority1,
                    Priority2 = environment.Priority2,
                    Priority3 = environment.Priority3,
                    ActionItemsUpdates = environment.ActionItemsUpdates,
                    UptimeScheduleNote = environment.UptimeScheduleNote,
                    UptimeScheduleNoteSummary = environment.UptimeScheduleNoteSummary,
                    ConfigurationCustomisationVersion = environment.ConfigurationCustomisationVersion,
                    DNSURL = environment.DNSURL,
                    Status = environment.Status,
                })
                .ToList();
        }

        public async Task<EnvironmentOverviewDTO> CreateEnvironmentOverviewAsynchronous(CreateEnvironmentOverviewRequestDTO request)
        {
            bool hasExistingRows = await _applicationDatabaseContext.EnvironmentOverviews.AnyAsync();
            int nextDisplayOrder = hasExistingRows
                ? await _applicationDatabaseContext.EnvironmentOverviews.MaxAsync(environment => environment.DisplayOrder) + 1
                : 1;

            EnvironmentOverviewNexus newEnvironment = new()
            {
                Id = Guid.NewGuid(),
                DisplayOrder = nextDisplayOrder,
                Environment = request.Environment,
                Purpose = request.Purpose,
                Sponsor = request.Sponsor,
                CurrentUptimeSchedule = request.CurrentUptimeSchedule,
                Priority1 = request.Priority1,
                Priority2 = request.Priority2,
                Priority3 = request.Priority3,
                ActionItemsUpdates = request.ActionItemsUpdates,
                ConfigurationCustomisationVersion = request.ConfigurationCustomisationVersion,
                DNSURL = request.DNSURL,
                Status = "Live",
            };

            _applicationDatabaseContext.EnvironmentOverviews.Add(newEnvironment);
            await _applicationDatabaseContext.SaveChangesAsync();

            return new EnvironmentOverviewDTO
            {
                Id = newEnvironment.Id,
                Environment = newEnvironment.Environment,
                Purpose = newEnvironment.Purpose,
                Sponsor = newEnvironment.Sponsor,
                CurrentUptimeSchedule = newEnvironment.CurrentUptimeSchedule,
                Priority1 = newEnvironment.Priority1,
                Priority2 = newEnvironment.Priority2,
                Priority3 = newEnvironment.Priority3,
                ActionItemsUpdates = newEnvironment.ActionItemsUpdates,
                UptimeScheduleNote = newEnvironment.UptimeScheduleNote,
                UptimeScheduleNoteSummary = newEnvironment.UptimeScheduleNoteSummary,
                ConfigurationCustomisationVersion = newEnvironment.ConfigurationCustomisationVersion,
                DNSURL = newEnvironment.DNSURL,
                Status = newEnvironment.Status,
            };
        }

        // configurationKey is already resolved from the public fieldName via
        // EnvironmentOverviewAssertion.AssertOptionsFieldName before either
        // of these run - shared by Status and Sponsor (and any future
        // growable-dropdown field) rather than one GetXOptions/AddXOption
        // pair per field.
        public async Task<EnvironmentOverviewDTO> UpdateStatusAsynchronous(Guid id, string status, string changedByClientId)
        {
            EnvironmentOverviewNexus? environment = await _applicationDatabaseContext.EnvironmentOverviews
                .FirstOrDefaultAsync(existingEnvironment => existingEnvironment.Id == id);

            if (environment is null)
            {
                throw new NotFoundException("That environment could not be found.");
            }

            string previousStatus = environment.Status;
            environment.Status = status;

            _applicationDatabaseContext.EnvironmentOverviewStatusHistories.Add(new EnvironmentOverviewStatusHistoryNexus
            {
                Id = Guid.NewGuid(),
                EnvironmentOverviewId = environment.Id,
                PreviousStatus = previousStatus,
                NewStatus = status,
                ChangedByClientId = changedByClientId,
                ChangedAt = DateTime.UtcNow,
            });

            await _applicationDatabaseContext.SaveChangesAsync();

            return new EnvironmentOverviewDTO
            {
                Id = environment.Id,
                Environment = environment.Environment,
                Purpose = environment.Purpose,
                Sponsor = environment.Sponsor,
                CurrentUptimeSchedule = environment.CurrentUptimeSchedule,
                Priority1 = environment.Priority1,
                Priority2 = environment.Priority2,
                Priority3 = environment.Priority3,
                ActionItemsUpdates = environment.ActionItemsUpdates,
                UptimeScheduleNote = environment.UptimeScheduleNote,
                UptimeScheduleNoteSummary = environment.UptimeScheduleNoteSummary,
                ConfigurationCustomisationVersion = environment.ConfigurationCustomisationVersion,
                DNSURL = environment.DNSURL,
                Status = environment.Status,
            };
        }

        // New entries are prepended, not appended - matches the source
        // data's own existing newest-first convention (every real entry in
        // this column reads top-to-bottom as newest-to-oldest). The date
        // prefix format ("dd-MMM-yyyy") matches ActionItemsLineParserUtility's
        // own normalized display format on the frontend exactly, so this
        // new entry parses and renders identically to every pre-existing one.
        public async Task<EnvironmentOverviewDTO> AddActionItemAsynchronous(Guid id, string note)
        {
            EnvironmentOverviewNexus? environment = await _applicationDatabaseContext.EnvironmentOverviews
                .FirstOrDefaultAsync(existingEnvironment => existingEnvironment.Id == id);

            if (environment is null)
            {
                throw new NotFoundException("That environment could not be found.");
            }

            string formattedDate = DateTime.UtcNow.ToString("dd-MMM-yyyy", CultureInfo.InvariantCulture);
            string newLine = $"{formattedDate}: {note.Trim()}";

            environment.ActionItemsUpdates = string.IsNullOrEmpty(environment.ActionItemsUpdates)
                ? newLine
                : $"{newLine}\n{environment.ActionItemsUpdates}";

            await _applicationDatabaseContext.SaveChangesAsync();

            return new EnvironmentOverviewDTO
            {
                Id = environment.Id,
                Environment = environment.Environment,
                Purpose = environment.Purpose,
                Sponsor = environment.Sponsor,
                CurrentUptimeSchedule = environment.CurrentUptimeSchedule,
                Priority1 = environment.Priority1,
                Priority2 = environment.Priority2,
                Priority3 = environment.Priority3,
                ActionItemsUpdates = environment.ActionItemsUpdates,
                UptimeScheduleNote = environment.UptimeScheduleNote,
                UptimeScheduleNoteSummary = environment.UptimeScheduleNoteSummary,
                ConfigurationCustomisationVersion = environment.ConfigurationCustomisationVersion,
                DNSURL = environment.DNSURL,
                Status = environment.Status,
            };
        }

        // lineIndex addressing and the "no per-entry identity" reasoning are
        // the same as DeleteActionItemAsynchronous below - this just swaps
        // one line's text wholesale instead of removing it. Trusts
        // replacementLineText completely (no parsing here) - the frontend is
        // what preserves the original date/tag prefix byte-for-byte before
        // calling this, see UpdateActionItemRequestDTO.
        public async Task<EnvironmentOverviewDTO> UpdateActionItemAsynchronous(Guid id, int lineIndex, string replacementLineText)
        {
            EnvironmentOverviewNexus? environment = await _applicationDatabaseContext.EnvironmentOverviews
                .FirstOrDefaultAsync(existingEnvironment => existingEnvironment.Id == id);

            if (environment is null)
            {
                throw new NotFoundException("That environment could not be found.");
            }

            List<string> lines = (environment.ActionItemsUpdates ?? string.Empty)
                .Split('\n')
                .ToList();

            if (lineIndex < 0 || lineIndex >= lines.Count)
            {
                throw new ValidationException("That entry no longer exists - it may have already been changed or removed.");
            }

            lines[lineIndex] = replacementLineText.Trim();
            environment.ActionItemsUpdates = string.Join("\n", lines);

            await _applicationDatabaseContext.SaveChangesAsync();

            return new EnvironmentOverviewDTO
            {
                Id = environment.Id,
                Environment = environment.Environment,
                Purpose = environment.Purpose,
                Sponsor = environment.Sponsor,
                CurrentUptimeSchedule = environment.CurrentUptimeSchedule,
                Priority1 = environment.Priority1,
                Priority2 = environment.Priority2,
                Priority3 = environment.Priority3,
                ActionItemsUpdates = environment.ActionItemsUpdates,
                UptimeScheduleNote = environment.UptimeScheduleNote,
                UptimeScheduleNoteSummary = environment.UptimeScheduleNoteSummary,
                ConfigurationCustomisationVersion = environment.ConfigurationCustomisationVersion,
                DNSURL = environment.DNSURL,
                Status = environment.Status,
            };
        }

        // lineIndex is the entry's position in the current line-split list,
        // exactly as the frontend is already displaying it (every "visible"
        // line is always a genuine prefix of the full list - see
        // EnvironmentOverviewScreenController.getVisibleActionItemsLines -
        // so a line's position within the collapsed view is already its true
        // position in the full list, no separate index translation needed).
        // No per-entry identity exists in this single free-text column, so
        // this is a straightforward hard delete of that line - there's no
        // equivalent of IsDecommissioned's soft-delete pattern for one line
        // within a text blob the way there is for a whole row.
        public async Task<EnvironmentOverviewDTO> DeleteActionItemAsynchronous(Guid id, int lineIndex)
        {
            EnvironmentOverviewNexus? environment = await _applicationDatabaseContext.EnvironmentOverviews
                .FirstOrDefaultAsync(existingEnvironment => existingEnvironment.Id == id);

            if (environment is null)
            {
                throw new NotFoundException("That environment could not be found.");
            }

            List<string> lines = (environment.ActionItemsUpdates ?? string.Empty)
                .Split('\n')
                .ToList();

            if (lineIndex < 0 || lineIndex >= lines.Count)
            {
                throw new ValidationException("That entry no longer exists - it may have already been changed or removed.");
            }

            lines.RemoveAt(lineIndex);
            environment.ActionItemsUpdates = lines.Count > 0 ? string.Join("\n", lines) : null;

            await _applicationDatabaseContext.SaveChangesAsync();

            return new EnvironmentOverviewDTO
            {
                Id = environment.Id,
                Environment = environment.Environment,
                Purpose = environment.Purpose,
                Sponsor = environment.Sponsor,
                CurrentUptimeSchedule = environment.CurrentUptimeSchedule,
                Priority1 = environment.Priority1,
                Priority2 = environment.Priority2,
                Priority3 = environment.Priority3,
                ActionItemsUpdates = environment.ActionItemsUpdates,
                UptimeScheduleNote = environment.UptimeScheduleNote,
                UptimeScheduleNoteSummary = environment.UptimeScheduleNoteSummary,
                ConfigurationCustomisationVersion = environment.ConfigurationCustomisationVersion,
                DNSURL = environment.DNSURL,
                Status = environment.Status,
            };
        }

        // FieldName is already validated against the allow-list in
        // EnvironmentOverviewAssertion.AssertUpdateFieldRequest before this
        // runs - the switch below is exhaustive over that same allow-list,
        // so the default branch is unreachable in practice, not a silent
        // fallback for an unvalidated value.
        public async Task<EnvironmentOverviewDTO> UpdateFieldAsynchronous(Guid id, string fieldName, string? value)
        {
            EnvironmentOverviewNexus? environment = await _applicationDatabaseContext.EnvironmentOverviews
                .FirstOrDefaultAsync(existingEnvironment => existingEnvironment.Id == id);

            if (environment is null)
            {
                throw new NotFoundException("That environment could not be found.");
            }

            string? normalisedValue = string.IsNullOrWhiteSpace(value) ? null : value.Trim();

            switch (fieldName)
            {
                // normalisedValue is guaranteed non-null here specifically -
                // AssertUpdateFieldRequest already rejects a blank value for
                // "Environment" before this runs, unlike every other case
                // below where null (cleared back to "not set") is the
                // legitimate blank state.
                case "Environment":
                    environment.Environment = normalisedValue!;
                    break;
                case "Purpose":
                    environment.Purpose = normalisedValue;
                    break;
                case "Sponsor":
                    environment.Sponsor = normalisedValue;
                    break;
                case "CurrentUptimeSchedule":
                    environment.CurrentUptimeSchedule = normalisedValue;
                    break;
                case "Priority1":
                    environment.Priority1 = normalisedValue;
                    break;
                case "Priority2":
                    environment.Priority2 = normalisedValue;
                    break;
                case "Priority3":
                    environment.Priority3 = normalisedValue;
                    break;
                case "DNSURL":
                    environment.DNSURL = normalisedValue;
                    break;
                default:
                    throw new ValidationException($"'{fieldName}' is not an editable field.");
            }

            await _applicationDatabaseContext.SaveChangesAsync();

            return new EnvironmentOverviewDTO
            {
                Id = environment.Id,
                Environment = environment.Environment,
                Purpose = environment.Purpose,
                Sponsor = environment.Sponsor,
                CurrentUptimeSchedule = environment.CurrentUptimeSchedule,
                Priority1 = environment.Priority1,
                Priority2 = environment.Priority2,
                Priority3 = environment.Priority3,
                ActionItemsUpdates = environment.ActionItemsUpdates,
                UptimeScheduleNote = environment.UptimeScheduleNote,
                UptimeScheduleNoteSummary = environment.UptimeScheduleNoteSummary,
                ConfigurationCustomisationVersion = environment.ConfigurationCustomisationVersion,
                DNSURL = environment.DNSURL,
                Status = environment.Status,
            };
        }

        // Separate from UpdateFieldAsynchronous (not a case added to its own
        // switch) since this needs to persist TWO values together
        // (CurrentUptimeSchedule's own composed string, plus the raw note)
        // and - only when a long note needs summarizing - make a Groq call,
        // neither of which the generic single-field endpoint supports.
        public async Task<EnvironmentOverviewDTO> UpdateUptimeScheduleAsynchronous(
            Guid id, string? currentUptimeSchedule, string? uptimeScheduleNote)
        {
            EnvironmentOverviewNexus? environment = await _applicationDatabaseContext.EnvironmentOverviews
                .FirstOrDefaultAsync(existingEnvironment => existingEnvironment.Id == id);

            if (environment is null)
            {
                throw new NotFoundException("That environment could not be found.");
            }

            environment.CurrentUptimeSchedule = string.IsNullOrWhiteSpace(currentUptimeSchedule)
                ? null
                : currentUptimeSchedule.Trim();

            string? trimmedNote = string.IsNullOrWhiteSpace(uptimeScheduleNote) ? null : uptimeScheduleNote.Trim();
            environment.UptimeScheduleNote = trimmedNote;

            if (trimmedNote is null)
            {
                environment.UptimeScheduleNoteSummary = null;
            }
            else if (trimmedNote.Length <= NoteSummaryThresholdLength)
            {
                environment.UptimeScheduleNoteSummary = trimmedNote;
            }
            else
            {
                environment.UptimeScheduleNoteSummary =
                    await SummarizeUptimeScheduleNoteAsynchronous(trimmedNote)
                    ?? trimmedNote[..NoteSummaryFallbackTruncateLength].TrimEnd() + "…";
            }

            await _applicationDatabaseContext.SaveChangesAsync();

            return new EnvironmentOverviewDTO
            {
                Id = environment.Id,
                Environment = environment.Environment,
                Purpose = environment.Purpose,
                Sponsor = environment.Sponsor,
                CurrentUptimeSchedule = environment.CurrentUptimeSchedule,
                Priority1 = environment.Priority1,
                Priority2 = environment.Priority2,
                Priority3 = environment.Priority3,
                ActionItemsUpdates = environment.ActionItemsUpdates,
                UptimeScheduleNote = environment.UptimeScheduleNote,
                UptimeScheduleNoteSummary = environment.UptimeScheduleNoteSummary,
                ConfigurationCustomisationVersion = environment.ConfigurationCustomisationVersion,
                DNSURL = environment.DNSURL,
                Status = environment.Status,
            };
        }

        // Fully self-contained and isolated - own HttpClient, own try/catch,
        // never throws. Any failure (rate limit, network, malformed
        // response) just returns null, and the caller falls back to plain
        // truncation - a summarization hiccup must never block saving the
        // rest of the Uptime Schedule form. Mirrors
        // ChatAssistantService.GenerateConversationTitleAsynchronous's own
        // isolation reasoning and request/response shape exactly (reusing
        // its GroqRequestDTO/GroqResponseDTO/GroqInputMessageDTO models -
        // those are plain data shapes with no dependency on
        // ChatAssistantService itself).
        private async Task<string?> SummarizeUptimeScheduleNoteAsynchronous(string note)
        {
            try
            {
                string groqApiKey = ENValidatorHelper.Current.GetEnvKeyValue("GROQ_API_KEY");

                var groqRequest = new GroqRequestDTO
                {
                    Model = GroqModel,
                    Instructions =
                        "Rewrite the user's note below as ONE short sentence, around 15 words (well under 150 " +
                        "characters) - it needs to fit on a single line of a table cell, so brevity matters " +
                        "more than mirroring the original's exact phrasing. Paraphrase aggressively: merge " +
                        "related points, drop filler words, use abbreviations where natural. The only hard " +
                        "rule is not to drop any distinct FACT or DECISION from the original (a date, a name, " +
                        "a reason, a next step) - everything else about HOW it's worded is fair game to " +
                        "compress. Reply with ONLY the rewritten sentence - no preamble, no quotes.",
                    Input = new List<object> { new GroqInputMessageDTO { Role = "user", Content = note } },
                };

                using var httpRequestMessage = new HttpRequestMessage(HttpMethod.Post, GroqResponsesEndpointURL)
                {
                    Content = JsonContent.Create(groqRequest),
                };
                httpRequestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", groqApiKey);

                using HttpResponseMessage httpResponseMessage = await _httpClient.SendAsync(httpRequestMessage);
                if (!httpResponseMessage.IsSuccessStatusCode) return null;

                GroqResponseDTO? groqResponse = await httpResponseMessage.Content.ReadFromJsonAsync<GroqResponseDTO>();
                List<GroqResponseOutputItemDTO> outputItems = groqResponse?.Output ?? new List<GroqResponseOutputItemDTO>();

                string? condensed = outputItems
                    .Where(outputItem => outputItem.Type == "message")
                    .SelectMany(outputItem => outputItem.Content ?? new List<GroqResponseContentItemDTO>())
                    .Where(contentItem => contentItem.Type == "output_text")
                    .Select(contentItem => contentItem.Text)
                    .FirstOrDefault(text => !string.IsNullOrWhiteSpace(text));

                return string.IsNullOrWhiteSpace(condensed) ? null : condensed.Trim().Trim('"', '\'', '“', '”', '‘', '’');
            }
            catch
            {
                return null;
            }
        }

        // Soft delete - sets IsDeleted/DeletedAt rather than removing the
        // row (see EnvironmentOverviewNexus.IsDeleted). The global query
        // filter on this entity means every other query already behaves as
        // if the row is gone, without this method needing to touch
        // anything else (Status History rows, column widths, etc. are left
        // exactly as they were).
        public async Task DeleteEnvironmentOverviewAsynchronous(Guid id)
        {
            EnvironmentOverviewNexus? environment = await _applicationDatabaseContext.EnvironmentOverviews
                .FirstOrDefaultAsync(existingEnvironment => existingEnvironment.Id == id);

            if (environment is null)
            {
                throw new NotFoundException("That environment could not be found.");
            }

            environment.IsDeleted = true;
            environment.DeletedAt = DateTime.UtcNow;

            await _applicationDatabaseContext.SaveChangesAsync();
        }

        public async Task<List<EnvironmentOverviewCellFormatDTO>> GetCellFormatsAsynchronous()
        {
            return await _applicationDatabaseContext.EnvironmentOverviewCellFormats
                .AsNoTracking()
                .Select(cellFormat => new EnvironmentOverviewCellFormatDTO
                {
                    EnvironmentOverviewId = cellFormat.EnvironmentOverviewId,
                    ColumnKey = cellFormat.ColumnKey,
                    IsBold = cellFormat.IsBold,
                    IsItalic = cellFormat.IsItalic,
                    IsUnderline = cellFormat.IsUnderline,
                    BackgroundColorKey = cellFormat.BackgroundColorKey,
                    BackgroundOpacity = cellFormat.BackgroundOpacity,
                    TextColorKey = cellFormat.TextColorKey,
                })
                .ToListAsync();
        }

        // Mirrors ResourcesService.UpdateCellFormatAsynchronous exactly - a
        // merge per targeted cell, not a replace, and a cell that ends up
        // back at fully-default is removed rather than left behind as a
        // no-op row. See that method's own comment for the full rationale.
        public async Task<List<EnvironmentOverviewCellFormatDTO>> UpdateCellFormatAsynchronous(UpdateEnvironmentOverviewCellFormatRequestDTO request)
        {
            foreach (EnvironmentOverviewCellFormatTargetDTO target in request.Cells)
            {
                EnvironmentOverviewCellFormatNexus? existing = await _applicationDatabaseContext.EnvironmentOverviewCellFormats
                    .FirstOrDefaultAsync(cellFormat =>
                        cellFormat.EnvironmentOverviewId == target.EnvironmentOverviewId && cellFormat.ColumnKey == target.ColumnKey);

                EnvironmentOverviewCellFormatNexus cellFormatRow = existing ?? new EnvironmentOverviewCellFormatNexus
                {
                    Id = Guid.NewGuid(),
                    EnvironmentOverviewId = target.EnvironmentOverviewId,
                    ColumnKey = target.ColumnKey,
                    BackgroundOpacity = 100,
                };

                if (request.IsBold.HasValue) cellFormatRow.IsBold = request.IsBold.Value;
                if (request.IsItalic.HasValue) cellFormatRow.IsItalic = request.IsItalic.Value;
                if (request.IsUnderline.HasValue) cellFormatRow.IsUnderline = request.IsUnderline.Value;
                if (request.ClearBackgroundColor)
                {
                    cellFormatRow.BackgroundColorKey = null;
                    cellFormatRow.BackgroundOpacity = 100;
                }
                else
                {
                    if (request.BackgroundColorKey is not null) cellFormatRow.BackgroundColorKey = request.BackgroundColorKey;
                    if (request.BackgroundOpacity.HasValue) cellFormatRow.BackgroundOpacity = Math.Clamp(request.BackgroundOpacity.Value, 0, 100);
                }

                if (request.ClearTextColor || string.Equals(request.TextColorKey, "default", StringComparison.OrdinalIgnoreCase))
                {
                    cellFormatRow.TextColorKey = null;
                }
                else if (request.TextColorKey is not null)
                {
                    cellFormatRow.TextColorKey = request.TextColorKey.ToLowerInvariant();
                }

                cellFormatRow.UpdatedAt = DateTime.UtcNow;

                bool isNowDefault = !cellFormatRow.IsBold && !cellFormatRow.IsItalic && !cellFormatRow.IsUnderline && cellFormatRow.BackgroundColorKey is null && cellFormatRow.TextColorKey is null;

                if (existing is null)
                {
                    if (!isNowDefault) _applicationDatabaseContext.EnvironmentOverviewCellFormats.Add(cellFormatRow);
                }
                else if (isNowDefault)
                {
                    _applicationDatabaseContext.EnvironmentOverviewCellFormats.Remove(existing);
                }
            }

            await _applicationDatabaseContext.SaveChangesAsync();

            return await GetCellFormatsAsynchronous();
        }
    }
}
