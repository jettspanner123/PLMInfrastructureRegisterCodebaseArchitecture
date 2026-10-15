using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddUptimeScheduleOptionConstants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "IG_ConfigurationConstantTBL",
                columns: new[] { "Id", "ConfigurationKey", "ConfigurationValue", "CreatedAt", "Notes", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("4a6b1c2d-3e4f-4a5b-8c6d-7e8f9a0b1c2d"), "ENVIRONMENT_OVERVIEW_UPTIME_SCHEDULE_TYPE_OPTIONS", "[\"24 x 7 Uptime\",\"On Demand\",\"N/A\"]", new DateTime(2026, 10, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Valid \"special\" (non-weekday) values for the Current Uptime Schedule dropdown's mutually-exclusive mode selector, growable via its own \"Add New\" button.", null },
                    { new Guid("5b7c2d3e-4f5a-4b6c-9d7e-8f9a0b1c2d3e"), "ENVIRONMENT_OVERVIEW_ON_DEMAND_STATUS_OPTIONS", "[\"Currently Stopped\",\"Currently Running\"]", new DateTime(2026, 10, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Valid second-line values when Current Uptime Schedule's mode is \"On Demand\", growable via its own \"Add New\" button.", null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "IG_ConfigurationConstantTBL",
                keyColumn: "Id",
                keyValue: new Guid("4a6b1c2d-3e4f-4a5b-8c6d-7e8f9a0b1c2d"));

            migrationBuilder.DeleteData(
                table: "IG_ConfigurationConstantTBL",
                keyColumn: "Id",
                keyValue: new Guid("5b7c2d3e-4f5a-4b6c-9d7e-8f9a0b1c2d3e"));
        }
    }
}
