using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddConfiguredSubscriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConfiguredSubscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AzureSubscriptionId = table.Column<string>(type: "text", nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfiguredSubscriptions", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ConfiguredSubscriptions",
                columns: new[] { "Id", "AzureSubscriptionId", "DisplayName" },
                values: new object[,]
                {
                    { new Guid("3e9a4c2b-1d7e-4f6a-8b2c-2a5d9e7f1c44"), "a5adb684-975e-4f1f-8769-93bcdf28e936", "ct-private-devtest-01" },
                    { new Guid("8f14e45f-ceea-467e-aded-c0a75a6c1b0a"), "5ce689ab-68b4-4c31-8244-22f9f06d84b0", "ac-hybrid-devtest-01" },
                    { new Guid("c7f1b1d4-4a9b-4e3b-9c9a-6f3b4a8a9b10"), "0cbdd8c2-9831-494b-b07b-76952fb13d3a", "ac-hybrid-production-01" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ConfiguredSubscriptions_AzureSubscriptionId",
                table: "ConfiguredSubscriptions",
                column: "AzureSubscriptionId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConfiguredSubscriptions");
        }
    }
}
