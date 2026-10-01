using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Helpers;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Utilities;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data
{
    public sealed class ApplicationDatabaseContextFactory : IDesignTimeDbContextFactory<ApplicationDatabaseContext>
    {
        public ApplicationDatabaseContext CreateDbContext(string[] args)
        {
            string unpooledConnectionUrl = ENValidatorHelper.Current.GetEnvKeyValue("DATABASE_URL_UNPOOLED");
            string npgsqlConnectionString = DatabaseConnectionStringUtility.ConvertNeonUriToNpgsqlConnectionString(unpooledConnectionUrl);

            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDatabaseContext>();
            optionsBuilder.UseNpgsql(npgsqlConnectionString);

            return new ApplicationDatabaseContext(optionsBuilder.Options);
        }
    }
}
