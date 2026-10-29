using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Admin.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentUptimeRequests.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.FeatureRequests.Models;
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

        public DbSet<ResourceCellFormatNexus> ResourceCellFormats => Set<ResourceCellFormatNexus>();

        public DbSet<ConfiguredSubscription> ConfiguredSubscriptions => Set<ConfiguredSubscription>();

        public DbSet<ConfigurationConstantClass> ConfigurationConstants => Set<ConfigurationConstantClass>();

        public DbSet<EnvironmentOverviewNexus> EnvironmentOverviews => Set<EnvironmentOverviewNexus>();

        public DbSet<EnvironmentOverviewStatusHistoryNexus> EnvironmentOverviewStatusHistories =>
            Set<EnvironmentOverviewStatusHistoryNexus>();

        public DbSet<EnvironmentOverviewCellFormatNexus> EnvironmentOverviewCellFormats =>
            Set<EnvironmentOverviewCellFormatNexus>();

        public DbSet<EnvironmentOverviewCustomColumnNexus> EnvironmentOverviewCustomColumns =>
            Set<EnvironmentOverviewCustomColumnNexus>();

        public DbSet<EnvironmentOverviewCustomColumnOptionNexus> EnvironmentOverviewCustomColumnOptions =>
            Set<EnvironmentOverviewCustomColumnOptionNexus>();

        public DbSet<EnvironmentOverviewCustomCellValueNexus> EnvironmentOverviewCustomCellValues =>
            Set<EnvironmentOverviewCustomCellValueNexus>();

        public DbSet<ChatConversationNexus> ChatConversations => Set<ChatConversationNexus>();

        public DbSet<ChatMessageNexus> ChatMessages => Set<ChatMessageNexus>();

        public DbSet<FeatureRequestNexus> FeatureRequests => Set<FeatureRequestNexus>();

        public DbSet<EnvironmentUptimeRequestNexus> EnvironmentUptimeRequests => Set<EnvironmentUptimeRequestNexus>();

        public DbSet<AdminAccountNexus> AdminAccounts => Set<AdminAccountNexus>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ResourceNexus>(entity =>
            {
                entity.ToTable("IG_ResourcesTBL");
                entity.HasKey(resource => resource.Id);
                entity.Property(resource => resource.Status).HasConversion<string>();
            });

            modelBuilder.Entity<ResourceCellFormatNexus>(entity =>
            {
                entity.ToTable("IG_ResourceCellFormatTBL");
                entity.HasKey(cellFormat => cellFormat.Id);
                // One row per (Resource, column) - a second right-click
                // format change on the same cell updates this same row
                // rather than creating a duplicate.
                entity.HasIndex(cellFormat => new { cellFormat.ResourceId, cellFormat.ColumnKey }).IsUnique();
            });

            modelBuilder.Entity<EnvironmentOverviewCellFormatNexus>(entity =>
            {
                entity.ToTable("IG_EnvironmentOverviewCellFormatTBL");
                entity.HasKey(cellFormat => cellFormat.Id);
                entity.HasIndex(cellFormat => new { cellFormat.EnvironmentOverviewId, cellFormat.ColumnKey }).IsUnique();
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
                    },
                    new ConfigurationConstantClass
                    {
                        Id = Guid.Parse("7d51a405-d373-4b20-b96c-53e7238ae1d5"),
                        ConfigurationKey = "RESOURCE_CELL_FORMAT_CUSTOM_COLORS",
                        ConfigurationValue = "[]",
                        Notes = "User-added custom background colors (raw \"#RRGGBB\" hex strings) for Infrastructure Register's right-click cell formatting, growable via its context menu's \"Add Color\" option - starts empty, unlike Status/Sponsor there's no existing data to seed from.",
                        CreatedAt = new DateTime(2026, 10, 9, 0, 0, 0, DateTimeKind.Utc),
                    },
                    new ConfigurationConstantClass
                    {
                        Id = Guid.Parse("4a6b1c2d-3e4f-4a5b-8c6d-7e8f9a0b1c2d"),
                        ConfigurationKey = "ENVIRONMENT_OVERVIEW_UPTIME_SCHEDULE_TYPE_OPTIONS",
                        ConfigurationValue = "[\"24 x 7 Uptime\",\"On Demand\",\"N/A\"]",
                        Notes = "Valid \"special\" (non-weekday) values for the Current Uptime Schedule dropdown's mutually-exclusive mode selector, growable via its own \"Add New\" button.",
                        CreatedAt = new DateTime(2026, 10, 15, 0, 0, 0, DateTimeKind.Utc),
                    },
                    new ConfigurationConstantClass
                    {
                        Id = Guid.Parse("5b7c2d3e-4f5a-4b6c-9d7e-8f9a0b1c2d3e"),
                        ConfigurationKey = "ENVIRONMENT_OVERVIEW_ON_DEMAND_STATUS_OPTIONS",
                        ConfigurationValue = "[\"Currently Stopped\",\"Currently Running\"]",
                        Notes = "Valid second-line values when Current Uptime Schedule's mode is \"On Demand\", growable via its own \"Add New\" button.",
                        CreatedAt = new DateTime(2026, 10, 15, 0, 0, 0, DateTimeKind.Utc),
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

            modelBuilder.Entity<EnvironmentOverviewCustomColumnNexus>(entity =>
            {
                entity.ToTable("IG_EnvironmentOverviewCustomColumnTBL");
                entity.HasKey(customColumn => customColumn.Id);
                entity.Property(customColumn => customColumn.ColumnType).HasConversion<string>();
                entity.HasQueryFilter(customColumn => !customColumn.IsDeleted);
            });

            modelBuilder.Entity<EnvironmentOverviewCustomColumnOptionNexus>(entity =>
            {
                entity.ToTable("IG_EnvironmentOverviewCustomColumnOptionTBL");
                entity.HasKey(option => option.Id);
                entity.HasIndex(option => option.CustomColumnId);
            });

            modelBuilder.Entity<EnvironmentOverviewCustomCellValueNexus>(entity =>
            {
                entity.ToTable("IG_EnvironmentOverviewCustomCellValueTBL");
                // Composite key - a row only ever has one value per custom
                // column, so there's no separate surrogate Id to manage.
                entity.HasKey(cellValue => new { cellValue.EnvironmentOverviewId, cellValue.CustomColumnId });
                entity.HasIndex(cellValue => cellValue.CustomColumnId);
            });

            modelBuilder.Entity<EnvironmentOverviewStatusHistoryNexus>(entity =>
            {
                entity.ToTable("IG_EnvironmentOverviewStatusHistoryTBL");
                entity.HasKey(history => history.Id);
                entity.HasIndex(history => history.EnvironmentOverviewId);
            });

            modelBuilder.Entity<ChatConversationNexus>(entity =>
            {
                entity.ToTable("IG_ChatConversationTBL");
                entity.HasKey(conversation => conversation.Id);
                // Powers the sidebar's own "list this client's conversations,
                // newest first" query.
                entity.HasIndex(conversation => conversation.AnonymousClientId);
            });

            modelBuilder.Entity<ChatMessageNexus>(entity =>
            {
                entity.ToTable("IG_ChatMessageTBL");
                entity.HasKey(message => message.Id);
                entity.HasIndex(message => message.ConversationId);
            });

            modelBuilder.Entity<FeatureRequestNexus>(entity =>
            {
                entity.ToTable("IG_FeatureRequestsTBL");
                entity.HasKey(request => request.Id);
                entity.Property(request => request.Category).HasConversion<string>();
                entity.Property(request => request.Priority).HasConversion<string>();
                entity.Property(request => request.Status).HasConversion<string>();
                entity.HasQueryFilter(request => !request.IsDeleted);
            });

            modelBuilder.Entity<EnvironmentUptimeRequestNexus>(entity =>
            {
                entity.ToTable("IG_EnvironmentUptimeRequestTBL", table =>
                {
                    table.HasCheckConstraint("CK_EnvironmentUptimeRequestTBL_TicketNumber_Max", "\"TicketNumber\" <= 99999");
                });

                entity.HasKey(request => request.Id);

                entity.Property(request => request.TicketNumber)
                    .ValueGeneratedOnAdd()
                    .UseIdentityAlwaysColumn();

                entity.Property(request => request.TicketId)
                    .HasComputedColumnSql("'UPTM-' || lpad(\"TicketNumber\"::text, 5, '0')", stored: true);

                entity.Property(request => request.Status).HasConversion<string>();

                // Same convention as EnvironmentOverviewNexus - excludes
                // soft-deleted rows from every normal query automatically,
                // so services never need to repeat `!request.IsDeleted` by
                // hand.
                entity.HasQueryFilter(request => !request.IsDeleted);
            });

            modelBuilder.Entity<AdminAccountNexus>(entity =>
            {
                entity.ToTable("IG_AdminAccountTBL");
                entity.HasKey(account => account.Id);
                entity.HasIndex(account => account.Email).IsUnique();
            });
        }
    }
}
