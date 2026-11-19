using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddRequesterEmailAndJiraFieldsToUptimeRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "JiraTicketKey",
                table: "IG_EnvironmentUptimeRequestTBL",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "JiraTicketUrl",
                table: "IG_EnvironmentUptimeRequestTBL",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequesterEmail",
                table: "IG_EnvironmentUptimeRequestTBL",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "IG_TicketCreationErrorTBL",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AttemptedTicketId = table.Column<string>(type: "text", nullable: true),
                    Environment = table.Column<string>(type: "text", nullable: false),
                    RequesterName = table.Column<string>(type: "text", nullable: false),
                    RequesterEmail = table.Column<string>(type: "text", nullable: false),
                    FromAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ToAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: true),
                    AttemptedSummary = table.Column<string>(type: "text", nullable: false),
                    AttemptedDescription = table.Column<string>(type: "text", nullable: false),
                    FailureReason = table.Column<string>(type: "text", nullable: false),
                    JiraStatusCode = table.Column<int>(type: "integer", nullable: true),
                    JiraResponseBody = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IG_TicketCreationErrorTBL", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IG_TicketCreationErrorTBL");

            migrationBuilder.DropColumn(
                name: "JiraTicketKey",
                table: "IG_EnvironmentUptimeRequestTBL");

            migrationBuilder.DropColumn(
                name: "JiraTicketUrl",
                table: "IG_EnvironmentUptimeRequestTBL");

            migrationBuilder.DropColumn(
                name: "RequesterEmail",
                table: "IG_EnvironmentUptimeRequestTBL");
        }
    }
}
