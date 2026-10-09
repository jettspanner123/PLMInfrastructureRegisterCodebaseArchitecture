using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddResourceCellFormatCustomColors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "IG_ConfigurationConstantTBL",
                columns: new[] { "Id", "ConfigurationKey", "ConfigurationValue", "CreatedAt", "Notes", "UpdatedAt" },
                values: new object[] { new Guid("7d51a405-d373-4b20-b96c-53e7238ae1d5"), "RESOURCE_CELL_FORMAT_CUSTOM_COLORS", "[]", new DateTime(2026, 10, 9, 0, 0, 0, 0, DateTimeKind.Utc), "User-added custom background colors (raw \"#RRGGBB\" hex strings) for Infrastructure Register's right-click cell formatting, growable via its context menu's \"Add Color\" option - starts empty, unlike Status/Sponsor there's no existing data to seed from.", null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "IG_ConfigurationConstantTBL",
                keyColumn: "Id",
                keyValue: new Guid("7d51a405-d373-4b20-b96c-53e7238ae1d5"));
        }
    }
}
