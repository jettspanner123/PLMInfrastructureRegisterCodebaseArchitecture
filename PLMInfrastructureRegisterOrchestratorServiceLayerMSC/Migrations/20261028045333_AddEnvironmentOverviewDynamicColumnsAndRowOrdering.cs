using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddEnvironmentOverviewDynamicColumnsAndRowOrdering : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "DisplayOrder",
                table: "IG_EnvironmentOverviewTBL",
                type: "double precision",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateTable(
                name: "IG_EnvironmentOverviewCustomCellValueTBL",
                columns: table => new
                {
                    EnvironmentOverviewId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomColumnId = table.Column<Guid>(type: "uuid", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IG_EnvironmentOverviewCustomCellValueTBL", x => new { x.EnvironmentOverviewId, x.CustomColumnId });
                });

            migrationBuilder.CreateTable(
                name: "IG_EnvironmentOverviewCustomColumnOptionTBL",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomColumnId = table.Column<Guid>(type: "uuid", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IG_EnvironmentOverviewCustomColumnOptionTBL", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IG_EnvironmentOverviewCustomColumnTBL",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HeaderName = table.Column<string>(type: "text", nullable: false),
                    ColumnType = table.Column<string>(type: "text", nullable: false),
                    Position = table.Column<double>(type: "double precision", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IG_EnvironmentOverviewCustomColumnTBL", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IG_EnvironmentOverviewCustomCellValueTBL_CustomColumnId",
                table: "IG_EnvironmentOverviewCustomCellValueTBL",
                column: "CustomColumnId");

            migrationBuilder.CreateIndex(
                name: "IX_IG_EnvironmentOverviewCustomColumnOptionTBL_CustomColumnId",
                table: "IG_EnvironmentOverviewCustomColumnOptionTBL",
                column: "CustomColumnId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IG_EnvironmentOverviewCustomCellValueTBL");

            migrationBuilder.DropTable(
                name: "IG_EnvironmentOverviewCustomColumnOptionTBL");

            migrationBuilder.DropTable(
                name: "IG_EnvironmentOverviewCustomColumnTBL");

            migrationBuilder.AlterColumn<int>(
                name: "DisplayOrder",
                table: "IG_EnvironmentOverviewTBL",
                type: "integer",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "double precision");
        }
    }
}
