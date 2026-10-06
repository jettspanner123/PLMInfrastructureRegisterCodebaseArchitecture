using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class FixMissingEnvironmentTagBackfill : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // A prior migration's hand-pasted SQL block accidentally dropped 11
            // of its UPDATE statements (AIASNLAS0113 through AIASNLAS0123) -
            // this just re-applies exactly those, idempotently.
            migrationBuilder.Sql(@"
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0113';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0114';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0115';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0116';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0117';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0118';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0119';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0120';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0121';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production' WHERE ""Hostname"" = 'AIASNLAS0122';
UPDATE ""IG_ResourcesTBL"" SET ""EnvironmentTag"" = 'Production Data Migration' WHERE ""Hostname"" = 'AIASNLAS0123';
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
