using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddEnvironmentOverviewUptimeScheduleNote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UptimeScheduleNote",
                table: "IG_EnvironmentOverviewTBL",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UptimeScheduleNoteSummary",
                table: "IG_EnvironmentOverviewTBL",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UptimeScheduleNote",
                table: "IG_EnvironmentOverviewTBL");

            migrationBuilder.DropColumn(
                name: "UptimeScheduleNoteSummary",
                table: "IG_EnvironmentOverviewTBL");
        }
    }
}
