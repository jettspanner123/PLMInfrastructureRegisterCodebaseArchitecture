using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class RevisionCollapseDowntimeAnnouncementEnvironments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IG_DowntimeAnnouncementEnvironmentTBL");

            migrationBuilder.AddColumn<string>(
                name: "Environments",
                table: "IG_DowntimeAnnouncementTBL",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Environments",
                table: "IG_DowntimeAnnouncementTBL");

            migrationBuilder.CreateTable(
                name: "IG_DowntimeAnnouncementEnvironmentTBL",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DowntimeAnnouncementId = table.Column<Guid>(type: "uuid", nullable: false),
                    EnvironmentName = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IG_DowntimeAnnouncementEnvironmentTBL", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IG_DowntimeAnnouncementEnvironmentTBL_DowntimeAnnouncementI~",
                table: "IG_DowntimeAnnouncementEnvironmentTBL",
                columns: new[] { "DowntimeAnnouncementId", "EnvironmentName" },
                unique: true);
        }
    }
}
