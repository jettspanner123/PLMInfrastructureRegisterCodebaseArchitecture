using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddResourceCellFormat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "IG_ResourceCellFormatTBL",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ResourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    ColumnKey = table.Column<string>(type: "text", nullable: false),
                    IsBold = table.Column<bool>(type: "boolean", nullable: false),
                    IsItalic = table.Column<bool>(type: "boolean", nullable: false),
                    BackgroundColorKey = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IG_ResourceCellFormatTBL", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IG_ResourceCellFormatTBL_ResourceId_ColumnKey",
                table: "IG_ResourceCellFormatTBL",
                columns: new[] { "ResourceId", "ColumnKey" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IG_ResourceCellFormatTBL");
        }
    }
}
