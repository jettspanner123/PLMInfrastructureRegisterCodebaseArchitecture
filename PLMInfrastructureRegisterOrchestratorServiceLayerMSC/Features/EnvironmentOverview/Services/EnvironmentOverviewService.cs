using System.Globalization;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Assertion;
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

            // One bulk query for every row's custom cell values rather than
            // one query per row (N+1) - grouped client-side by row id via
            // ILookup, same reasoning as GetCellFormatsAsynchronous already
            // loading every format row up front.
            ILookup<Guid, EnvironmentOverviewCustomCellValueNexus> customCellValuesByRow = (await _applicationDatabaseContext
                .EnvironmentOverviewCustomCellValues
                .AsNoTracking()
                .ToListAsync())
                .ToLookup(cellValue => cellValue.EnvironmentOverviewId);

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
                    CustomCellValues = customCellValuesByRow[environment.Id]
                        .ToDictionary(cellValue => cellValue.CustomColumnId.ToString(), cellValue => cellValue.Value),
                })
                .ToList();
        }

        // Single-row counterpart of the bulk lookup above - used by every
        // mutation method below so each one's returned DTO carries the same
        // CustomCellValues shape as the list endpoint, without needing to
        // repeat this query inline at every call site.
        private async Task<Dictionary<string, string?>> GetCustomCellValuesForRowAsynchronous(Guid environmentOverviewId)
        {
            return await _applicationDatabaseContext.EnvironmentOverviewCustomCellValues
                .AsNoTracking()
                .Where(cellValue => cellValue.EnvironmentOverviewId == environmentOverviewId)
                .ToDictionaryAsync(cellValue => cellValue.CustomColumnId.ToString(), cellValue => cellValue.Value);
        }

        private async Task<EnvironmentOverviewDTO> BuildEnvironmentOverviewDTOAsynchronous(EnvironmentOverviewNexus environment)
        {
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
                CustomCellValues = await GetCustomCellValuesForRowAsynchronous(environment.Id),
            };
        }

        public async Task<EnvironmentOverviewDTO> CreateEnvironmentOverviewAsynchronous(CreateEnvironmentOverviewRequestDTO request)
        {
            bool hasExistingRows = await _applicationDatabaseContext.EnvironmentOverviews.AnyAsync();
            double nextDisplayOrder = hasExistingRows
                ? await _applicationDatabaseContext.EnvironmentOverviews.MaxAsync(environment => environment.DisplayOrder) + 1000
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

            return await BuildEnvironmentOverviewDTOAsynchronous(newEnvironment);
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

            return await BuildEnvironmentOverviewDTOAsynchronous(environment);
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

            return await BuildEnvironmentOverviewDTOAsynchronous(environment);
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

            return await BuildEnvironmentOverviewDTOAsynchronous(environment);
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

            return await BuildEnvironmentOverviewDTOAsynchronous(environment);
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

            return await BuildEnvironmentOverviewDTOAsynchronous(environment);
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

            return await BuildEnvironmentOverviewDTOAsynchronous(environment);
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

        // Mirrors EnvironmentOverviewCON.COLUMNS' own order on the frontend
        // exactly - both sides are hand-kept in sync (same pattern as
        // EDITABLE_TEXT_FIELD_NAMES being duplicated frontend/backend
        // already). Widely spaced (1000 apart) so a custom column can always
        // be slotted in via a midpoint without ever colliding with a
        // neighbor, no matter how many times the same gap gets split.
        private static readonly Dictionary<string, double> FixedColumnAnchors = new(StringComparer.OrdinalIgnoreCase)
        {
            ["environment"] = 1000,
            ["purpose"] = 2000,
            ["sponsor"] = 3000,
            ["currentUptimeSchedule"] = 4000,
            ["priority1"] = 5000,
            ["priority2"] = 6000,
            ["priority3"] = 7000,
            ["configurationCustomisationVersion"] = 8000,
            ["dnsurl"] = 9000,
            ["actionItemsUpdates"] = 10000,
            ["status"] = 11000,
        };

        // Inserting "N rows above/below the same target" repeatedly (the
        // spreadsheet-style range-insert case - see
        // EnvironmentOverviewScreenController) naturally stacks each new row
        // in the correct visual order with no special bulk path needed: each
        // call's midpoint slots in between the PREVIOUS call's new row and
        // the original target, so N sequential single-row inserts already
        // produce the right final order on their own.
        private async Task<double> ComputeInsertRowDisplayOrderAsynchronous(Guid? relativeToId, string direction)
        {
            List<EnvironmentOverviewNexus> allRows = await _applicationDatabaseContext.EnvironmentOverviews
                .AsNoTracking()
                .OrderBy(environment => environment.DisplayOrder)
                .ToListAsync();

            if (allRows.Count == 0)
            {
                return 1000;
            }

            if (relativeToId is null)
            {
                return direction == "Above"
                    ? allRows[0].DisplayOrder - 1000
                    : allRows[^1].DisplayOrder + 1000;
            }

            int index = allRows.FindIndex(environment => environment.Id == relativeToId.Value);
            if (index < 0)
            {
                throw new NotFoundException("That environment could not be found.");
            }

            double targetOrder = allRows[index].DisplayOrder;

            if (direction == "Above")
            {
                double? beforeOrder = index > 0 ? allRows[index - 1].DisplayOrder : null;
                return beforeOrder.HasValue ? (beforeOrder.Value + targetOrder) / 2 : targetOrder - 1000;
            }

            double? afterOrder = index < allRows.Count - 1 ? allRows[index + 1].DisplayOrder : null;
            return afterOrder.HasValue ? (targetOrder + afterOrder.Value) / 2 : targetOrder + 1000;
        }

        // Skips any name already in use by a non-deleted row (case-
        // insensitive) rather than risking two rows that read identically -
        // "New Environment", then "New Environment 2", "New Environment 3",
        // and so on.
        private async Task<string> GeneratePlaceholderEnvironmentNameAsynchronous()
        {
            HashSet<string> existingNames = new(
                await _applicationDatabaseContext.EnvironmentOverviews.AsNoTracking().Select(environment => environment.Environment).ToListAsync(),
                StringComparer.OrdinalIgnoreCase);

            const string baseName = "New Environment";
            if (!existingNames.Contains(baseName))
            {
                return baseName;
            }

            int suffix = 2;
            while (existingNames.Contains($"{baseName} {suffix}"))
            {
                suffix++;
            }

            return $"{baseName} {suffix}";
        }

        // Backs both the right-click "Add Row Above/Below" actions and the
        // unified "Add Environment" toolbar button (RelativeToId null,
        // Direction "Below" = append to the end, matching that button's old
        // behavior) - see InsertRowRequestDTO for the full null-handling
        // contract.
        public async Task<EnvironmentOverviewDTO> InsertRowAsynchronous(InsertRowRequestDTO request)
        {
            double newDisplayOrder = await ComputeInsertRowDisplayOrderAsynchronous(request.RelativeToId, request.Direction!);
            string placeholderName = await GeneratePlaceholderEnvironmentNameAsynchronous();

            EnvironmentOverviewNexus newEnvironment = new()
            {
                Id = Guid.NewGuid(),
                DisplayOrder = newDisplayOrder,
                Environment = placeholderName,
                Status = "Live",
            };

            _applicationDatabaseContext.EnvironmentOverviews.Add(newEnvironment);
            await _applicationDatabaseContext.SaveChangesAsync();

            return await BuildEnvironmentOverviewDTOAsynchronous(newEnvironment);
        }

        public async Task<List<EnvironmentOverviewCustomColumnDTO>> GetCustomColumnsAsynchronous()
        {
            List<EnvironmentOverviewCustomColumnNexus> customColumns = await _applicationDatabaseContext
                .EnvironmentOverviewCustomColumns
                .AsNoTracking()
                .OrderBy(customColumn => customColumn.Position)
                .ToListAsync();

            ILookup<Guid, string> optionsByColumn = (await _applicationDatabaseContext
                .EnvironmentOverviewCustomColumnOptions
                .AsNoTracking()
                .OrderBy(option => option.CreatedAt)
                .ToListAsync())
                .ToLookup(option => option.CustomColumnId, option => option.Value);

            return customColumns.Select(customColumn => new EnvironmentOverviewCustomColumnDTO
            {
                Id = customColumn.Id,
                HeaderName = customColumn.HeaderName,
                ColumnType = customColumn.ColumnType.ToString(),
                Position = customColumn.Position,
                Options = optionsByColumn[customColumn.Id].ToList(),
            }).ToList();
        }

        private async Task<EnvironmentOverviewCustomColumnDTO> BuildCustomColumnDTOAsynchronous(EnvironmentOverviewCustomColumnNexus customColumn)
        {
            List<string> options = await _applicationDatabaseContext.EnvironmentOverviewCustomColumnOptions
                .AsNoTracking()
                .Where(option => option.CustomColumnId == customColumn.Id)
                .OrderBy(option => option.CreatedAt)
                .Select(option => option.Value)
                .ToListAsync();

            return new EnvironmentOverviewCustomColumnDTO
            {
                Id = customColumn.Id,
                HeaderName = customColumn.HeaderName,
                ColumnType = customColumn.ColumnType.ToString(),
                Position = customColumn.Position,
                Options = options,
            };
        }

        // columnKey is either a fixed anchor key (e.g. "purpose") or a
        // custom column's Id as a string - whichever one the right-click or
        // header menu fired from. Returns (0, false) when neither resolves,
        // which the caller turns into a NotFoundException.
        private async Task<(double Position, bool Found)> ResolveColumnPositionAsynchronous(string columnKey)
        {
            if (FixedColumnAnchors.TryGetValue(columnKey, out double fixedPosition))
            {
                return (fixedPosition, true);
            }

            if (Guid.TryParse(columnKey, out Guid customColumnId))
            {
                EnvironmentOverviewCustomColumnNexus? customColumn = await _applicationDatabaseContext
                    .EnvironmentOverviewCustomColumns
                    .AsNoTracking()
                    .FirstOrDefaultAsync(column => column.Id == customColumnId);

                if (customColumn is not null)
                {
                    return (customColumn.Position, true);
                }
            }

            return (0, false);
        }

        public async Task<EnvironmentOverviewCustomColumnDTO> CreateCustomColumnAsynchronous(CreateCustomColumnRequestDTO request)
        {
            string relativeToColumnKey = request.RelativeToColumnKey!;
            string direction = request.Direction!;
            CustomColumnTypeEnum columnType = Enum.Parse<CustomColumnTypeEnum>(request.ColumnType!);

            // Defense in depth - the UI already disables this combination,
            // but Environment must stay the leftmost column regardless of
            // what any client sends.
            if (direction == "Left" && string.Equals(relativeToColumnKey, "environment", StringComparison.OrdinalIgnoreCase))
            {
                throw new ValidationException("Columns cannot be added to the left of Environment.");
            }

            (double relativePosition, bool found) = await ResolveColumnPositionAsynchronous(relativeToColumnKey);
            if (!found)
            {
                throw new NotFoundException("That column could not be found.");
            }

            // Merges every fixed anchor with every live custom column's own
            // Position into one sorted list, so the true current neighbor is
            // used even if other custom columns have been inserted around
            // the target since it was first created.
            List<double> allPositions = FixedColumnAnchors.Values
                .Concat(await _applicationDatabaseContext.EnvironmentOverviewCustomColumns.AsNoTracking().Select(column => column.Position).ToListAsync())
                .OrderBy(position => position)
                .ToList();

            int index = allPositions.FindIndex(position => position == relativePosition);

            double newPosition;
            if (direction == "Left")
            {
                double? before = index > 0 ? allPositions[index - 1] : null;
                newPosition = before.HasValue ? (before.Value + relativePosition) / 2 : relativePosition - 1000;
            }
            else
            {
                double? after = index < allPositions.Count - 1 ? allPositions[index + 1] : null;
                newPosition = after.HasValue ? (relativePosition + after.Value) / 2 : relativePosition + 1000;
            }

            EnvironmentOverviewCustomColumnNexus newColumn = new()
            {
                Id = Guid.NewGuid(),
                HeaderName = "New Column",
                ColumnType = columnType,
                Position = newPosition,
                CreatedAt = DateTime.UtcNow,
            };

            _applicationDatabaseContext.EnvironmentOverviewCustomColumns.Add(newColumn);
            await _applicationDatabaseContext.SaveChangesAsync();

            return await BuildCustomColumnDTOAsynchronous(newColumn);
        }

        public async Task<EnvironmentOverviewCustomColumnDTO> UpdateCustomColumnHeaderAsynchronous(Guid id, string? headerName)
        {
            EnvironmentOverviewCustomColumnNexus? customColumn = await _applicationDatabaseContext
                .EnvironmentOverviewCustomColumns
                .FirstOrDefaultAsync(column => column.Id == id);

            if (customColumn is null)
            {
                throw new NotFoundException("That column could not be found.");
            }

            customColumn.HeaderName = string.IsNullOrWhiteSpace(headerName) ? "New Column" : headerName.Trim();
            await _applicationDatabaseContext.SaveChangesAsync();

            return await BuildCustomColumnDTOAsynchronous(customColumn);
        }

        // Soft delete - the column disappears from the table and the
        // Columns visibility dropdown immediately, but every cell value ever
        // entered under it is left completely untouched in
        // IG_EnvironmentOverviewCustomCellValueTBL, matching this app's
        // "nothing just disappears" convention everywhere else.
        public async Task DeleteCustomColumnAsynchronous(Guid id)
        {
            EnvironmentOverviewCustomColumnNexus? customColumn = await _applicationDatabaseContext
                .EnvironmentOverviewCustomColumns
                .FirstOrDefaultAsync(column => column.Id == id);

            if (customColumn is null)
            {
                throw new NotFoundException("That column could not be found.");
            }

            customColumn.IsDeleted = true;
            customColumn.DeletedAt = DateTime.UtcNow;
            await _applicationDatabaseContext.SaveChangesAsync();
        }

        // Appends a new option to a Dropdown column's own private list (a
        // no-op if that exact value already exists) - the "type to add a new
        // option inline" growable-list flow the frontend's searchable select
        // already uses for Status/Sponsor, scoped here to just one column.
        public async Task<EnvironmentOverviewCustomColumnDTO> AddCustomColumnOptionAsynchronous(Guid customColumnId, string value)
        {
            EnvironmentOverviewCustomColumnNexus? customColumn = await _applicationDatabaseContext
                .EnvironmentOverviewCustomColumns
                .AsNoTracking()
                .FirstOrDefaultAsync(column => column.Id == customColumnId);

            if (customColumn is null)
            {
                throw new NotFoundException("That column could not be found.");
            }

            string trimmedValue = value.Trim();

            bool alreadyExists = await _applicationDatabaseContext.EnvironmentOverviewCustomColumnOptions
                .AnyAsync(option => option.CustomColumnId == customColumnId && option.Value == trimmedValue);

            if (!alreadyExists)
            {
                _applicationDatabaseContext.EnvironmentOverviewCustomColumnOptions.Add(new EnvironmentOverviewCustomColumnOptionNexus
                {
                    Id = Guid.NewGuid(),
                    CustomColumnId = customColumnId,
                    Value = trimmedValue,
                    CreatedAt = DateTime.UtcNow,
                });
                await _applicationDatabaseContext.SaveChangesAsync();
            }

            return await BuildCustomColumnDTOAsynchronous(customColumn);
        }

        // The type-specific validation here (AssertUpsertCustomCellValueRequest
        // needing columnType) can only run once the column is actually
        // loaded, so it happens here rather than up front in the controller
        // the way every other Assert call in this feature does.
        public async Task<EnvironmentOverviewDTO> UpsertCustomCellValueAsynchronous(
            Guid environmentOverviewId, Guid customColumnId, UpsertCustomCellValueRequestDTO request)
        {
            EnvironmentOverviewNexus? environment = await _applicationDatabaseContext.EnvironmentOverviews
                .FirstOrDefaultAsync(existingEnvironment => existingEnvironment.Id == environmentOverviewId);

            if (environment is null)
            {
                throw new NotFoundException("That environment could not be found.");
            }

            EnvironmentOverviewCustomColumnNexus? customColumn = await _applicationDatabaseContext
                .EnvironmentOverviewCustomColumns
                .AsNoTracking()
                .FirstOrDefaultAsync(column => column.Id == customColumnId);

            if (customColumn is null)
            {
                throw new NotFoundException("That column could not be found.");
            }

            EnvironmentOverviewAssertion.Current.AssertUpsertCustomCellValueRequest(request, customColumn.ColumnType);

            string? normalizedValue = string.IsNullOrWhiteSpace(request.Value) ? null : request.Value.Trim();

            EnvironmentOverviewCustomCellValueNexus? existing = await _applicationDatabaseContext
                .EnvironmentOverviewCustomCellValues
                .FirstOrDefaultAsync(cellValue =>
                    cellValue.EnvironmentOverviewId == environmentOverviewId && cellValue.CustomColumnId == customColumnId);

            if (normalizedValue is null)
            {
                if (existing is not null)
                {
                    _applicationDatabaseContext.EnvironmentOverviewCustomCellValues.Remove(existing);
                }
            }
            else if (existing is not null)
            {
                existing.Value = normalizedValue;
            }
            else
            {
                _applicationDatabaseContext.EnvironmentOverviewCustomCellValues.Add(new EnvironmentOverviewCustomCellValueNexus
                {
                    EnvironmentOverviewId = environmentOverviewId,
                    CustomColumnId = customColumnId,
                    Value = normalizedValue,
                });
            }

            await _applicationDatabaseContext.SaveChangesAsync();

            return await BuildEnvironmentOverviewDTOAsynchronous(environment);
        }
    }
}
