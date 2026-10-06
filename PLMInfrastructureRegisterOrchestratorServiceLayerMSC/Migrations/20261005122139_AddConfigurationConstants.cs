using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddConfigurationConstants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "IG_ConfigurationConstantTBL",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConfigurationKey = table.Column<string>(type: "text", nullable: false),
                    ConfigurationValue = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IG_ConfigurationConstantTBL", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "IG_ConfigurationConstantTBL",
                columns: new[] { "Id", "ConfigurationKey", "ConfigurationValue", "CreatedAt", "Notes", "UpdatedAt" },
                values: new object[] { new Guid("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"), "ENVIRONMENT_TAGS", "[\"Production\",\"QA\",\"Testing\",\"Dev1\",\"Dev2\",\"Training\",\"Production Data Migration\",\"Migration Development\",\"DSLS\",\"Non-Production\",\"Secondary Non-Production\",\"21x OOTB\",\"25x OOTB\",\"Unknown\",\"SandBox (Functional)\",\"SandBox (Technical)\",\"Not Assigned\"]", new DateTime(2026, 10, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Valid values for Resources.EnvironmentTag, transcribed from the infrastructure register CSV.", null });

            migrationBuilder.CreateIndex(
                name: "IX_IG_ConfigurationConstantTBL_ConfigurationKey",
                table: "IG_ConfigurationConstantTBL",
                column: "ConfigurationKey",
                unique: true);

            // One-time backfill: assign every existing Resource's EnvironmentTag
            // from the infrastructure register CSV (by Hostname), using the
            // structured tag set above. Anything with no CSV match at all
            // (never recorded in the CSV, or whose own tag cell was itself
            // blank) falls through to "Not Assigned".

            migrationBuilder.Sql(@"
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0003';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0004';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'SandBox (Technical)' WHERE ""Hostname"" = 'AIASNLAS0006';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'SandBox (Functional)' WHERE ""Hostname"" = 'AIASNLAS0007';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Dev1' WHERE ""Hostname"" = 'AIASNLAS0008';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Migration Development' WHERE ""Hostname"" = 'AIASNLAS0009';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Migration Development' WHERE ""Hostname"" = 'AIASNLAS0010';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0011';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = '21x OOTB' WHERE ""Hostname"" = 'AIASNLAS0014';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Testing' WHERE ""Hostname"" = 'AIASNLAS0015';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Testing' WHERE ""Hostname"" = 'AIASNLAS0016';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Testing' WHERE ""Hostname"" = 'AIASNLAS0017';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Testing' WHERE ""Hostname"" = 'AIASNLAS0018';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Dev2' WHERE ""Hostname"" = 'AIASNLAS0019';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Testing' WHERE ""Hostname"" = 'AIASNLAS0020';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Testing' WHERE ""Hostname"" = 'AIASNLAS0021';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Dev1' WHERE ""Hostname"" = 'AIASNLAS0023';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Dev1' WHERE ""Hostname"" = 'AIASNLAS0026';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Dev2' WHERE ""Hostname"" = 'AIASNLAS0027';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Dev2' WHERE ""Hostname"" = 'AIASNLAS0028';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Testing' WHERE ""Hostname"" = 'AIASNLAS0029';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Dev2' WHERE ""Hostname"" = 'AIASNLAS0030';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Migration Development' WHERE ""Hostname"" = 'AIASNLAS0032';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Testing' WHERE ""Hostname"" = 'AIASNLAS0033';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Dev1' WHERE ""Hostname"" = 'AIASNLAS0034';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Training' WHERE ""Hostname"" = 'AIASNLAS0036';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Training' WHERE ""Hostname"" = 'AIASNLAS0037';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Training' WHERE ""Hostname"" = 'AIASNLAS0038';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Training' WHERE ""Hostname"" = 'AIASNLAS0039';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0040';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0041';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0042';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0043';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0044';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0045';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0046';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0047';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0048';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Unknown' WHERE ""Hostname"" = 'AIASNLAS004801';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0049';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0050';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0051';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0052';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0053';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0054';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0055';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0056';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0057';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Training' WHERE ""Hostname"" = 'AIASNLAS0058';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0059';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Training' WHERE ""Hostname"" = 'AIASNLAS0060';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Training' WHERE ""Hostname"" = 'AIASNLAS0061';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0062';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0063';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0064';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0065';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0066';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0067';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0068';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0069';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0070';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0071';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0072';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0073';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLAS0074';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0075';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0076';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0077';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0078';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0079';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0080';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0081';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0082';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0083';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0084';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Testing' WHERE ""Hostname"" = 'AIASNLAS0085';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0088';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0089';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0090';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0091';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0092';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0093';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0094';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0095';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0096';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0097';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0098';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0099';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0100';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0101';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0102';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0103';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0104';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0105';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0106';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0107';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0108';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0109';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0110';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0111';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0112';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0113';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0124';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0125';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0126';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0127';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0128';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0129';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0130';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0131';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0132';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0133';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0134';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0135';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Migration Development' WHERE ""Hostname"" = 'AIASNLAS0136';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Dev2' WHERE ""Hostname"" = 'AIASNLAS0137';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0138';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0139';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0140';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0141';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0142';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Non-Production' WHERE ""Hostname"" = 'AIASNLDB0001';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'AIASNLDB0002';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLDB0005';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLDB0006';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLDB0007';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Secondary Non-Production' WHERE ""Hostname"" = 'AIASNLDB0008';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'SSISINENO036';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = '25x OOTB' WHERE ""Hostname"" = 'vmd10008847e24x';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'fcsstoragehouston';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'fcsstoragehoustonprod';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'fcsstoragewuxi';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'fcsstoragewuxiprod';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'prodfcscentral';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Non-Production' WHERE ""Hostname"" = '2021xnonproddbbackups';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = '2021xproddbbackups';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'acstadapp10007216a';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'acstadapp10007216b';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'DSLS' WHERE ""Hostname"" = 'SSCSBEAP4103';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'DSLS' WHERE ""Hostname"" = 'SSCSBEAP4104';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'DSLS' WHERE ""Hostname"" = 'SSCSBEAP4105';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Dev1' WHERE ""Hostname"" = 'vmd10008847e001';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Dev1' WHERE ""Hostname"" = 'vmd10008847e002';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Dev2' WHERE ""Hostname"" = 'vmd10008847e003';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Dev2' WHERE ""Hostname"" = 'vmd10008847e004';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Testing' WHERE ""Hostname"" = 'vmt10008847e001';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Testing' WHERE ""Hostname"" = 'vmt10008847e002';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Training' WHERE ""Hostname"" = 'vmt10008847et01';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Training' WHERE ""Hostname"" = 'vmt10008847et02';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'vms10008847e001';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'vms10008847e002';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'vms10008847e004';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'vmp10008847ej01';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'vmp10008847ej02';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'vmp10008847ej03';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'vmp10008847ej04';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'vmp10008847ej05';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'vmp10008847ex01';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'vmp10008847ex02';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'vmp10008847em01';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'vmp10008847em02';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'vmp10008847em03';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'vmp10008847em04';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'vmp10008847afcs';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'vmd10008847afcs';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Not Assigned' WHERE ""Hostname"" = 'Atlas2021x3632';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Not Assigned' WHERE ""Hostname"" = 'Atlas2021x3634';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Dev1' WHERE ""Hostname"" = 'kv-d-10007216-001-r2021x';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Dev1' WHERE ""Hostname"" = 'kv-d-10007216-002-r2021x';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'kv-p-10007216-002-r2021x';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'kv-q-10007216-001-r2021x';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Testing' WHERE ""Hostname"" = 'kv-t-10007216-001-r2021x';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'QA' WHERE ""Hostname"" = 'SSISINFCSQA108';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Not Assigned' WHERE ""EnvironmentTag"" IS NULL;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IG_ConfigurationConstantTBL");
        }
    }
}
