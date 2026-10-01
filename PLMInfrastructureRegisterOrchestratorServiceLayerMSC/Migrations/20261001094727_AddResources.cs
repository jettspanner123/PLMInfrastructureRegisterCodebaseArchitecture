using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddResources : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Resources",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AzureResourceId = table.Column<string>(type: "text", nullable: true),
                    Hostname = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    PrivateIPAddress = table.Column<string>(type: "text", nullable: true),
                    Subscription = table.Column<string>(type: "text", nullable: true),
                    AutoShutdownEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AutoShutdownSchedule = table.Column<string>(type: "text", nullable: true),
                    AutoShutdownStartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    AutoShutdownEndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    ResourceGroup = table.Column<string>(type: "text", nullable: true),
                    Location = table.Column<string>(type: "text", nullable: true),
                    VirtualNetworkSubnet = table.Column<string>(type: "text", nullable: true),
                    OperatingSystem = table.Column<string>(type: "text", nullable: true),
                    Size = table.Column<string>(type: "text", nullable: true),
                    CpuCores = table.Column<int>(type: "integer", nullable: true),
                    RamGB = table.Column<int>(type: "integer", nullable: true),
                    Disk1OSPerformance = table.Column<string>(type: "text", nullable: true),
                    Disk2DataPerformance = table.Column<string>(type: "text", nullable: true),
                    Disk3DataType = table.Column<string>(type: "text", nullable: true),
                    Disk4DataType = table.Column<string>(type: "text", nullable: true),
                    Function = table.Column<string>(type: "text", nullable: true),
                    EnvironmentTag = table.Column<string>(type: "text", nullable: true),
                    DailyBackupTime = table.Column<string>(type: "text", nullable: true),
                    CronJobsTaskScheduler = table.Column<string>(type: "text", nullable: true),
                    DNS = table.Column<string>(type: "text", nullable: true),
                    URL = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<string>(type: "text", nullable: true),
                    PublicIPAddress = table.Column<string>(type: "text", nullable: true),
                    ProximityGroup = table.Column<string>(type: "text", nullable: true),
                    Disk5DataType = table.Column<string>(type: "text", nullable: true),
                    Disk6DataType = table.Column<string>(type: "text", nullable: true),
                    Disks = table.Column<string>(type: "text", nullable: true),
                    DatabaseInstance = table.Column<string>(type: "text", nullable: true),
                    DatabaseName = table.Column<string>(type: "text", nullable: true),
                    PlanVersion = table.Column<string>(type: "text", nullable: true),
                    BackupSchedule = table.Column<string>(type: "text", nullable: true),
                    BackupStatus = table.Column<string>(type: "text", nullable: true),
                    InfrastructureSupportAzure = table.Column<string>(type: "text", nullable: true),
                    InfrastructureSupportServiceLevel = table.Column<string>(type: "text", nullable: true),
                    DBASupport = table.Column<string>(type: "text", nullable: true),
                    DBASupportServiceLevel = table.Column<string>(type: "text", nullable: true),
                    Protocol = table.Column<string>(type: "text", nullable: true),
                    Port = table.Column<string>(type: "text", nullable: true),
                    TomEEPortConnector = table.Column<string>(type: "text", nullable: true),
                    SMTPEnabled = table.Column<string>(type: "text", nullable: true),
                    SMTPHostname = table.Column<string>(type: "text", nullable: true),
                    SMTPSender = table.Column<string>(type: "text", nullable: true),
                    Comment = table.Column<string>(type: "text", nullable: true),
                    OracleDBASupportRequired = table.Column<string>(type: "text", nullable: true),
                    JavaSupportRequired = table.Column<string>(type: "text", nullable: true),
                    ApacheSupportRequired = table.Column<string>(type: "text", nullable: true),
                    BackupRequired = table.Column<string>(type: "text", nullable: true),
                    OSSupportIncludingPatching = table.Column<string>(type: "text", nullable: true),
                    AzureMonitoringSetupRequired = table.Column<string>(type: "text", nullable: true),
                    ResponseSLARequirement = table.Column<string>(type: "text", nullable: true),
                    AtosAgentDeployed = table.Column<string>(type: "text", nullable: true),
                    ThreeDExperienceSXILicense = table.Column<string>(type: "text", nullable: true),
                    MonitoringHealthcheckURL = table.Column<string>(type: "text", nullable: true),
                    VMCreationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VMDeletionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NewHostname = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resources", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Resources");
        }
    }
}
