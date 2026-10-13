using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddEnvironmentOverviewCellFormat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "IG_EnvironmentOverviewCellFormatTBL",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EnvironmentOverviewId = table.Column<Guid>(type: "uuid", nullable: false),
                    ColumnKey = table.Column<string>(type: "text", nullable: false),
                    IsBold = table.Column<bool>(type: "boolean", nullable: false),
                    IsItalic = table.Column<bool>(type: "boolean", nullable: false),
                    BackgroundColorKey = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IG_EnvironmentOverviewCellFormatTBL", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IG_EnvironmentOverviewCellFormatTBL_EnvironmentOverviewId_C~",
                table: "IG_EnvironmentOverviewCellFormatTBL",
                columns: new[] { "EnvironmentOverviewId", "ColumnKey" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IG_EnvironmentOverviewCellFormatTBL");
        }
    }
}
