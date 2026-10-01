using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data
{
    public sealed class ApplicationDatabaseContext : DbContext
    {
        public ApplicationDatabaseContext(DbContextOptions<ApplicationDatabaseContext> options)
            : base(options)
        {
        }

        public DbSet<ResourceNexus> Resources => Set<ResourceNexus>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ResourceNexus>(entity =>
            {
                entity.ToTable("Resources");
                entity.HasKey(resource => resource.Id);
                entity.Property(resource => resource.Status).HasConversion<string>();
            });
        }
    }
}
