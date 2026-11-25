using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddFrontendDesignSchemaConfigurationConstant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "IG_ConfigurationConstantTBL",
                columns: new[] { "Id", "ConfigurationKey", "ConfigurationValue", "CreatedAt", "Notes", "UpdatedAt" },
                values: new object[] { new Guid("5c6139a7-c561-43fe-8274-2ff327e59d41"), "FRONTEND_DESIGN_SCHEMA", "[\"ATLASCOPCO\"]", new DateTime(2026, 11, 25, 0, 0, 0, 0, DateTimeKind.Utc), "Which look the frontend presents - \"WEPLM\" (today's existing look) or \"ATLASCOPCO\" (sharper corner rounding, no AI assistant button on Infrastructure Register, no Feature Request page). No in-app control changes this; edit the row directly. Recognized values are exactly \"WEPLM\" and \"ATLASCOPCO\" - anything else, or a missing row, falls back to \"ATLASCOPCO\".", null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "IG_ConfigurationConstantTBL",
                keyColumn: "Id",
                keyValue: new Guid("5c6139a7-c561-43fe-8274-2ff327e59d41"));
        }
    }
}
