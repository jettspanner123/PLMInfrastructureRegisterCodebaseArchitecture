using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models.Classes;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data
{
    public sealed class ApplicationDatabaseContext : DbContext
    {
        public ApplicationDatabaseContext(DbContextOptions<ApplicationDatabaseContext> options)
            : base(options)
        {
        }

        public DbSet<ResourceNexus> Resources => Set<ResourceNexus>();

        public DbSet<ConfiguredSubscription> ConfiguredSubscriptions => Set<ConfiguredSubscription>();

        public DbSet<ConfigurationConstantClass> ConfigurationConstants => Set<ConfigurationConstantClass>();

        public DbSet<EnvironmentOverviewNexus> EnvironmentOverviews => Set<EnvironmentOverviewNexus>();

        public DbSet<EnvironmentOverviewStatusHistoryNexus> EnvironmentOverviewStatusHistories =>
            Set<EnvironmentOverviewStatusHistoryNexus>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ResourceNexus>(entity =>
            {
                entity.ToTable("IG_ResourcesTBL");
                entity.HasKey(resource => resource.Id);
                entity.Property(resource => resource.Status).HasConversion<string>();
            });

            modelBuilder.Entity<ConfiguredSubscription>(entity =>
            {
                entity.ToTable("IG_ConfiguredSubscriptionsTBL");
                entity.HasKey(subscription => subscription.Id);
                entity.HasIndex(subscription => subscription.AzureSubscriptionId).IsUnique();

                // Seeded from the subscriptions actually present in the legacy
                // spreadsheet data, confirmed against the real Azure tenant via
                // `az account list` during the Sync design discussion.
                entity.HasData(
                    new ConfiguredSubscription
                    {
                        Id = Guid.Parse("8f14e45f-ceea-467e-aded-c0a75a6c1b0a"),
                        AzureSubscriptionId = "5ce689ab-68b4-4c31-8244-22f9f06d84b0",
                        DisplayName = "ac-hybrid-devtest-01",
                    },
                    new ConfiguredSubscription
                    {
                        Id = Guid.Parse("c7f1b1d4-4a9b-4e3b-9c9a-6f3b4a8a9b10"),
                        AzureSubscriptionId = "0cbdd8c2-9831-494b-b07b-76952fb13d3a",
                        DisplayName = "ac-hybrid-production-01",
                    },
                    new ConfiguredSubscription
                    {
                        Id = Guid.Parse("3e9a4c2b-1d7e-4f6a-8b2c-2a5d9e7f1c44"),
                        AzureSubscriptionId = "a5adb684-975e-4f1f-8769-93bcdf28e936",
                        DisplayName = "ct-private-devtest-01",
                    }
                );
            });

            modelBuilder.Entity<ConfigurationConstantClass>(entity =>
            {
                entity.ToTable("IG_ConfigurationConstantTBL");
                entity.HasKey(constant => constant.Id);
                entity.HasIndex(constant => constant.ConfigurationKey).IsUnique();

                // The approved, structured set of environment tags a Resource's
                // EnvironmentTag may be assigned - every value transcribed from
                // the infrastructure register CSV's own ENVIRONMENT (TAG)
                // column, plus "Not Assigned" as the fallback for anything
                // with no CSV match. Not an enum: a real enum can't gain a new
                // value without a code change and redeploy, which defeats
                // storing this "in the DB" in the first place.
                entity.HasData(
                    new ConfigurationConstantClass
                    {
                        Id = Guid.Parse("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"),
                        ConfigurationKey = "ENVIRONMENT_TAGS",
                        ConfigurationValue = "[\"Production\",\"QA\",\"Testing\",\"Dev1\",\"Dev2\",\"Training\",\"Production Data Migration\",\"Migration Development\",\"DSLS\",\"Non-Production\",\"Secondary Non-Production\",\"21x OOTB\",\"25x OOTB\",\"Unknown\",\"SandBox (Functional)\",\"SandBox (Technical)\",\"Not Assigned\"]",
                        Notes = "Valid values for Resources.EnvironmentTag, transcribed from the infrastructure register CSV.",
                        CreatedAt = new DateTime(2026, 10, 6, 0, 0, 0, DateTimeKind.Utc),
                    },
                    new ConfigurationConstantClass
                    {
                        Id = Guid.Parse("b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e"),
                        ConfigurationKey = "ENVIRONMENT_OVERVIEW_STATUS_OPTIONS",
                        ConfigurationValue = "[\"Live\",\"Decommissioned\"]",
                        Notes = "Valid values for EnvironmentOverview.Status, growable via the Edit Mode status dropdown's \"Create New Status\" button.",
                        CreatedAt = new DateTime(2026, 10, 8, 0, 0, 0, DateTimeKind.Utc),
                    },
                    new ConfigurationConstantClass
                    {
                        Id = Guid.Parse("1b09d9ad-6719-470d-8d43-c1c357bd8332"),
                        ConfigurationKey = "ENVIRONMENT_OVERVIEW_SPONSOR_OPTIONS",
                        ConfigurationValue = "[\"Ajay Shelke\",\"Balgovind\",\"Gopinath Karthikesan\",\"Heena Ahirrao\",\"Ilse Roegies\",\"Jacky Joseph\",\"N/A\",\"Pavan Gude\",\"Shruti Vedasen\",\"Stefaan Boel\",\"Tom Slegers\"]",
                        Notes = "Valid values for EnvironmentOverview.Sponsor, seeded from every distinct Sponsor already present in the infrastructure register CSV - growable via the Edit Mode sponsor dropdown's \"Add New Sponsor\" button.",
                        CreatedAt = new DateTime(2026, 10, 8, 0, 0, 0, DateTimeKind.Utc),
                    }
                );
            });

            modelBuilder.Entity<EnvironmentOverviewNexus>(entity =>
            {
                entity.ToTable("IG_EnvironmentOverviewTBL");
                entity.HasKey(environment => environment.Id);

                // Soft-deleted rows are excluded from every query against
                // this DbSet automatically (DeleteEnvironmentOverviewAsynchronous
                // sets IsDeleted instead of removing the row) - nothing
                // reading EnvironmentOverviews needs its own IsDeleted check.
                entity.HasQueryFilter(environment => !environment.IsDeleted);
            });

            modelBuilder.Entity<EnvironmentOverviewStatusHistoryNexus>(entity =>
            {
                entity.ToTable("IG_EnvironmentOverviewStatusHistoryTBL");
                entity.HasKey(history => history.Id);
                entity.HasIndex(history => history.EnvironmentOverviewId);
            });
        }
    }
}
