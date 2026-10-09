using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class RepairCorruptedCustomColorBackfill : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Repairs the corruption the previous BackfillCustomColorIds
            // migration caused on whichever environment already ran it
            // before this fix: each original string element got turned into
            // a 2-element array [originalJsonString, {"Id": ...}] instead of
            // being merged into one object (see that migration's updated
            // comment for why). Recoverable without data loss - element 0 is
            // still the exact original color text, element 1 still carries
            // the Id it was supposed to be merged into that same object.
            // Already-correct (plain object) elements pass through
            // unchanged, so this is safe to run whether or not the
            // corruption actually happened on a given environment.
            migrationBuilder.Sql(@"
                UPDATE ""IG_ConfigurationConstantTBL""
                SET ""ConfigurationValue"" = (
                    SELECT COALESCE(
                        jsonb_agg(
                            CASE
                                WHEN jsonb_typeof(elem) = 'array' THEN
                                    (((elem->>0)::jsonb) || (elem->1))::text
                                ELSE
                                    elem::text
                            END
                        ),
                        '[]'::jsonb
                    )
                    FROM jsonb_array_elements(""ConfigurationValue""::jsonb) AS elem
                )
                WHERE ""ConfigurationKey"" = 'RESOURCE_CELL_FORMAT_CUSTOM_COLORS'
                  AND jsonb_typeof(""ConfigurationValue""::jsonb) = 'array';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Irreversible - there's no way to tell which entries this
            // repaired versus which were already correct.
        }
    }
}
