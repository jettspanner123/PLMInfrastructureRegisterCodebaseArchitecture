using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class FixEnvironmentOverviewStatusColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Scaffolded order was Drop-then-Add, which would have lost every
            // existing row's Live/Decommissioned state (new Status rows would
            // all start as the blank default below, with IsDecommissioned
            // already gone to backfill from). Add-Backfill-Drop instead, same
            // pattern as this project's other backfill migrations.
            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "IG_EnvironmentOverviewTBL",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(@"
UPDATE ""IG_EnvironmentOverviewTBL""
SET ""Status"" = CASE WHEN ""IsDecommissioned"" THEN 'Decommissioned' ELSE 'Live' END;
");

            migrationBuilder.DropColumn(
                name: "IsDecommissioned",
                table: "IG_EnvironmentOverviewTBL");

            migrationBuilder.InsertData(
                table: "IG_ConfigurationConstantTBL",
                columns: new[] { "Id", "ConfigurationKey", "ConfigurationValue", "CreatedAt", "Notes", "UpdatedAt" },
                values: new object[] { new Guid("b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e"), "ENVIRONMENT_OVERVIEW_STATUS_OPTIONS", "[\"Live\",\"Decommissioned\"]", new DateTime(2026, 10, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Valid values for EnvironmentOverview.Status, growable via the Edit Mode status dropdown's \"Create New Status\" button.", null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "IG_ConfigurationConstantTBL",
                keyColumn: "Id",
                keyValue: new Guid("b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e"));

            migrationBuilder.AddColumn<bool>(
                name: "IsDecommissioned",
                table: "IG_EnvironmentOverviewTBL",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(@"
UPDATE ""IG_EnvironmentOverviewTBL""
SET ""IsDecommissioned"" = (""Status"" = 'Decommissioned');
");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "IG_EnvironmentOverviewTBL");
        }
    }
}
