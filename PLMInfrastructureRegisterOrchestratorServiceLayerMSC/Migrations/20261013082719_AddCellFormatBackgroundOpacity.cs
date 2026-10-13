using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddCellFormatBackgroundOpacity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BackgroundOpacity",
                table: "IG_ResourceCellFormatTBL",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "BackgroundOpacity",
                table: "IG_EnvironmentOverviewCellFormatTBL",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BackgroundOpacity",
                table: "IG_ResourceCellFormatTBL");

            migrationBuilder.DropColumn(
                name: "BackgroundOpacity",
                table: "IG_EnvironmentOverviewCellFormatTBL");
        }
    }
}
