using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAutoShutdownAddStartStopTags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AutoShutdownEnabled",
                table: "IG_ResourcesTBL");

            migrationBuilder.DropColumn(
                name: "AutoShutdownEndTime",
                table: "IG_ResourcesTBL");

            migrationBuilder.DropColumn(
                name: "AutoShutdownStartTime",
                table: "IG_ResourcesTBL");

            migrationBuilder.RenameColumn(
                name: "AutoShutdownSchedule",
                table: "IG_ResourcesTBL",
                newName: "StartStopTagsJson");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StartStopTagsJson",
                table: "IG_ResourcesTBL",
                newName: "AutoShutdownSchedule");

            migrationBuilder.AddColumn<bool>(
                name: "AutoShutdownEnabled",
                table: "IG_ResourcesTBL",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "AutoShutdownEndTime",
                table: "IG_ResourcesTBL",
                type: "time without time zone",
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "AutoShutdownStartTime",
                table: "IG_ResourcesTBL",
                type: "time without time zone",
                nullable: true);
        }
    }
}
