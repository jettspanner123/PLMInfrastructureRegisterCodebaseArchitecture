using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddChatMessageClarifyingQuestionColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSkipped",
                table: "IG_ChatMessageTBL",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "MessageKind",
                table: "IG_ChatMessageTBL",
                type: "text",
                nullable: false,
                defaultValue: "Text");

            migrationBuilder.AddColumn<string>(
                name: "PendingInputStateJson",
                table: "IG_ChatMessageTBL",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ToolCallArguments",
                table: "IG_ChatMessageTBL",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ToolCallId",
                table: "IG_ChatMessageTBL",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ToolCallOutput",
                table: "IG_ChatMessageTBL",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSkipped",
                table: "IG_ChatMessageTBL");

            migrationBuilder.DropColumn(
                name: "MessageKind",
                table: "IG_ChatMessageTBL");

            migrationBuilder.DropColumn(
                name: "PendingInputStateJson",
                table: "IG_ChatMessageTBL");

            migrationBuilder.DropColumn(
                name: "ToolCallArguments",
                table: "IG_ChatMessageTBL");

            migrationBuilder.DropColumn(
                name: "ToolCallId",
                table: "IG_ChatMessageTBL");

            migrationBuilder.DropColumn(
                name: "ToolCallOutput",
                table: "IG_ChatMessageTBL");
        }
    }
}
