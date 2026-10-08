using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddEnvironmentOverviewSponsorOptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "IG_ConfigurationConstantTBL",
                columns: new[] { "Id", "ConfigurationKey", "ConfigurationValue", "CreatedAt", "Notes", "UpdatedAt" },
                values: new object[] { new Guid("1b09d9ad-6719-470d-8d43-c1c357bd8332"), "ENVIRONMENT_OVERVIEW_SPONSOR_OPTIONS", "[\"Ajay Shelke\",\"Balgovind\",\"Gopinath Karthikesan\",\"Heena Ahirrao\",\"Ilse Roegies\",\"Jacky Joseph\",\"N/A\",\"Pavan Gude\",\"Shruti Vedasen\",\"Stefaan Boel\",\"Tom Slegers\"]", new DateTime(2026, 10, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Valid values for EnvironmentOverview.Sponsor, seeded from every distinct Sponsor already present in the infrastructure register CSV - growable via the Edit Mode sponsor dropdown's \"Add New Sponsor\" button.", null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "IG_ConfigurationConstantTBL",
                keyColumn: "Id",
                keyValue: new Guid("1b09d9ad-6719-470d-8d43-c1c357bd8332"));
        }
    }
}
