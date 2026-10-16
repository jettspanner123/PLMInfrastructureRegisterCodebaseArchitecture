using System;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddResourceTableLegendEntries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Built via JsonSerializer.Serialize here (not a hand-typed
            // escaped string literal) specifically to avoid hand-escaping
            // the double-nested JSON this growable-options mechanism uses
            // (an array of strings, each itself a JSON-encoded object) - see
            // ResourceTableLegendService's own comment for why that shape
            // exists. These two entries are the table's original,
            // structurally-locked system legends.
            DateTime seededAt = new DateTime(2026, 10, 16, 0, 0, 0, DateTimeKind.Utc);

            LegendEntryDTO azureSourcedLegend = new()
            {
                Id = new Guid("6f1a2b3c-4d5e-4f60-8172-839405a6b7c8"),
                Name = "Azure-sourced data",
                Format = "HEX",
                Color = "#0C2086",
                IsSystemLegend = true,
                CreatedBy = null,
                CreatedAt = seededAt,
            };

            LegendEntryDTO customTagsLegend = new()
            {
                Id = new Guid("7a2b3c4d-5e6f-4071-9283-94a5b6c7d8e9"),
                Name = "Custom tags",
                Format = "HEX",
                Color = "#C41E3A",
                IsSystemLegend = true,
                CreatedBy = null,
                CreatedAt = seededAt,
            };

            List<string> legendEntries = new()
            {
                JsonSerializer.Serialize(azureSourcedLegend),
                JsonSerializer.Serialize(customTagsLegend),
            };

            migrationBuilder.InsertData(
                table: "IG_ConfigurationConstantTBL",
                columns: new[] { "Id", "ConfigurationKey", "ConfigurationValue", "CreatedAt", "Notes", "UpdatedAt" },
                values: new object[,]
                {
                    {
                        new Guid("8b3c4d5e-6f70-4182-a394-b5c6d7e8f9a0"),
                        "RESOURCE_TABLE_LEGEND_ENTRIES",
                        JsonSerializer.Serialize(legendEntries),
                        seededAt,
                        "The Infrastructure Register page's user-manageable legend row. Azure-sourced data/Custom tags are the original, structurally-locked system legends (their colors are hardcoded elsewhere in the table's own header-rendering logic, not just here); user-created entries are appended via the Legends feature.",
                        null,
                    },
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "IG_ConfigurationConstantTBL",
                keyColumn: "ConfigurationKey",
                keyValue: "RESOURCE_TABLE_LEGEND_ENTRIES");
        }
    }
}
