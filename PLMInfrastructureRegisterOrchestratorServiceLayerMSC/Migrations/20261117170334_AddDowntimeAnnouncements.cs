using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddDowntimeAnnouncements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateTable(
                name: "IG_DowntimeAnnouncementTBL",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Heading = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    StartAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndedEarlyAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IG_DowntimeAnnouncementTBL", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IG_DowntimeAnnouncementEnvironmentTBL_DowntimeAnnouncementI~",
                table: "IG_DowntimeAnnouncementEnvironmentTBL",
                columns: new[] { "DowntimeAnnouncementId", "EnvironmentName" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IG_DowntimeAnnouncementEnvironmentTBL");

            migrationBuilder.DropTable(
                name: "IG_DowntimeAnnouncementTBL");
        }
    }
}
