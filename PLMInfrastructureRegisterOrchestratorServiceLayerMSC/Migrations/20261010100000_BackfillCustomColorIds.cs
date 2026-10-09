using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class BackfillCustomColorIds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Adds a stable "Id" to every custom-color entry that doesn't
            // already have one - CustomColorOptionDTO now needs a real
            // identity for rename/recolor/delete to target, since ColorName
            // alone stops being a safe key the moment renaming is possible.
            // Written to tolerate whatever's actually in the column today
            // (zero, one, or many entries), not a one-time snapshot of its
            // current content.
            //
            // ConfigurationValue stores a JSON array of STRINGS (each string
            // itself a separately JSON-encoded color object) - jsonb_array_
            // elements_text is what unwraps each element to that inner text
            // so it can be re-parsed as its own object with ::jsonb; the
            // plain (non-_text) form used in an earlier version of this
            // migration left each element as a jsonb STRING SCALAR, and `||`
            // between a scalar and an object silently produces a 2-element
            // array instead of a merge - corrupting every entry it touched.
            migrationBuilder.Sql(@"
                UPDATE ""IG_ConfigurationConstantTBL""
                SET ""ConfigurationValue"" = (
                    SELECT COALESCE(
                        jsonb_agg(
                            CASE
                                WHEN (elem_text::jsonb) ? 'Id' THEN elem_text
                                ELSE ((elem_text::jsonb) || jsonb_build_object('Id', gen_random_uuid()::text))::text
                            END
                        ),
                        '[]'::jsonb
                    )
                    FROM jsonb_array_elements_text(""ConfigurationValue""::jsonb) AS elem_text
                )
                WHERE ""ConfigurationKey"" = 'RESOURCE_CELL_FORMAT_CUSTOM_COLORS';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Irreversible - there's no way to tell which ids were backfilled
            // by Up versus genuinely assigned afterward by the application.
        }
    }
}
