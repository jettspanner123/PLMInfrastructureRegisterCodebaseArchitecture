using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddCellFormatTextColor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TextColorKey",
                table: "IG_ResourceCellFormatTBL",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TextColorKey",
                table: "IG_EnvironmentOverviewCellFormatTBL",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TextColorKey",
                table: "IG_ResourceCellFormatTBL");

            migrationBuilder.DropColumn(
                name: "TextColorKey",
                table: "IG_EnvironmentOverviewCellFormatTBL");
        }
    }
}
