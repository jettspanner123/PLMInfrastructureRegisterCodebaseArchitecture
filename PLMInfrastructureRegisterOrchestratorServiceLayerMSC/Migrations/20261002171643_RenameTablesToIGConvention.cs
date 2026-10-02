using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class RenameTablesToIGConvention : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Resources",
                table: "Resources");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ConfiguredSubscriptions",
                table: "ConfiguredSubscriptions");

            migrationBuilder.RenameTable(
                name: "Resources",
                newName: "IG_ResourcesTBL");

            migrationBuilder.RenameTable(
                name: "ConfiguredSubscriptions",
                newName: "IG_ConfiguredSubscriptionsTBL");

            migrationBuilder.RenameIndex(
                name: "IX_ConfiguredSubscriptions_AzureSubscriptionId",
                table: "IG_ConfiguredSubscriptionsTBL",
                newName: "IX_IG_ConfiguredSubscriptionsTBL_AzureSubscriptionId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_IG_ResourcesTBL",
                table: "IG_ResourcesTBL",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_IG_ConfiguredSubscriptionsTBL",
                table: "IG_ConfiguredSubscriptionsTBL",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_IG_ResourcesTBL",
                table: "IG_ResourcesTBL");

            migrationBuilder.DropPrimaryKey(
                name: "PK_IG_ConfiguredSubscriptionsTBL",
                table: "IG_ConfiguredSubscriptionsTBL");

            migrationBuilder.RenameTable(
                name: "IG_ResourcesTBL",
                newName: "Resources");

            migrationBuilder.RenameTable(
                name: "IG_ConfiguredSubscriptionsTBL",
                newName: "ConfiguredSubscriptions");

            migrationBuilder.RenameIndex(
                name: "IX_IG_ConfiguredSubscriptionsTBL_AzureSubscriptionId",
                table: "ConfiguredSubscriptions",
                newName: "IX_ConfiguredSubscriptions_AzureSubscriptionId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Resources",
                table: "Resources",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ConfiguredSubscriptions",
                table: "ConfiguredSubscriptions",
                column: "Id");
        }
    }
}
