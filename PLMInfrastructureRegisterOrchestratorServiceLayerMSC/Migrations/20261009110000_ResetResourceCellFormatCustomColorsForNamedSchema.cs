using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class ResetResourceCellFormatCustomColorsForNamedSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Each entry in this list is now a named, structured color
            // (ColorName/Format/Color/CreatedBy/CreatedAt JSON object) rather
            // than a bare "#RRGGBB" string - clears the one unnamed test
            // entry added before this change, since it can't be migrated
            // into the new shape.
            migrationBuilder.UpdateData(
                table: "IG_ConfigurationConstantTBL",
                keyColumn: "Id",
                keyValue: new Guid("7d51a405-d373-4b20-b96c-53e7238ae1d5"),
                column: "ConfigurationValue",
                value: "[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Irreversible - the unnamed test color this clears cannot be
            // reconstructed.
        }
    }
}
