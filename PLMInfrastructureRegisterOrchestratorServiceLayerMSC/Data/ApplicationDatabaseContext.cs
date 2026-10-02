using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Models;

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
        }
    }
}
