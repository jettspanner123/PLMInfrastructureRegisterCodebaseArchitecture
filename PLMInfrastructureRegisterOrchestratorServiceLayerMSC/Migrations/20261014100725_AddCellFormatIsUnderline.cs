using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddCellFormatIsUnderline : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsUnderline",
                table: "IG_ResourceCellFormatTBL",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsUnderline",
                table: "IG_EnvironmentOverviewCellFormatTBL",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsUnderline",
                table: "IG_ResourceCellFormatTBL");

            migrationBuilder.DropColumn(
                name: "IsUnderline",
                table: "IG_EnvironmentOverviewCellFormatTBL");
        }
    }
}
