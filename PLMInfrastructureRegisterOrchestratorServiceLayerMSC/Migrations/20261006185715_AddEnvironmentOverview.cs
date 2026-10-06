using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class AddEnvironmentOverview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "IG_EnvironmentOverviewTBL",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    Environment = table.Column<string>(type: "text", nullable: false),
                    Purpose = table.Column<string>(type: "text", nullable: true),
                    Sponsor = table.Column<string>(type: "text", nullable: true),
                    CurrentUptimeSchedule = table.Column<string>(type: "text", nullable: true),
                    Priority1 = table.Column<string>(type: "text", nullable: true),
                    Priority2 = table.Column<string>(type: "text", nullable: true),
                    Priority3 = table.Column<string>(type: "text", nullable: true),
                    ActionItemsUpdates = table.Column<string>(type: "text", nullable: true),
                    ConfigurationCustomisationVersion = table.Column<string>(type: "text", nullable: true),
                    DNSURL = table.Column<string>(type: "text", nullable: true),
                    IsDecommissioned = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IG_EnvironmentOverviewTBL", x => x.Id);
                });

            // One-time seed, transcribed verbatim (trimmed only) from the
            // infrastructure register's "Environment Overview" CSV. The
            // CSV's own "DECOMISSIONED ENVIRONMENTS" row is a section-divider
            // label, not a real environment, so it isn't stored here -
            // IsDecommissioned instead marks every row that appeared below
            // it in the source file. DisplayOrder preserves the CSV's own
            // row order (minus that one skipped divider row).
            migrationBuilder.Sql(@"
INSERT INTO ""IG_EnvironmentOverviewTBL"" (""Id"", ""DisplayOrder"", ""Environment"", ""Purpose"", ""Sponsor"", ""CurrentUptimeSchedule"", ""Priority1"", ""Priority2"", ""Priority3"", ""ActionItemsUpdates"", ""ConfigurationCustomisationVersion"", ""DNSURL"", ""IsDecommissioned"")
VALUES
('6cad73d0-a0c0-4e8b-a439-4e6a4c64f2e7', 1, '24x OOTB
25x OOTB', 'OOTB environment to be used by BAU Support - Run to check default behaviour and reproduce issues.', 'Balgovind', 'On Demand
Currently Stopped', 'Upgrade Team
Till 04-08-2026
Sergey will use till 27 August 2026 for PLM2.0', 'L1 Support Team & Functional Team', NULL, '21-May-2026: Platform of OOTB25x is ready to use.
19-March-2026: Platform of OOTB24x was been reverted from OOTB25x FD06 to OOTB24x FD07 based on Peter Zwysen requests (Completed).
24-Nov-2025 : As per Peter Zwysen  ,Need 24x OOTB env from 24 to 28 Nov 2025.
07-Oct-2025 : Agreed with Functional team to use this moving forwards instead of Sandbox Functional env.
29-09-2025 24x Upgrade team has finished exclusive access to this environment. 
10-Jun-2025: Remains 100% allocated to 24x upgrade.
10-Jun-2025: Remains 100% allocated to 24x upgrade
14-Apr-2025: New DB created and project team is installing 24x now.
07-Apr-2025: Changed name to 24x Sandbox.
24x team will be using this week to start the 24xFD07 installations. Team will requests env to be started this week.
13-Jan-2025: Environment confirmed stopped.
06-Jan-2025: Testing has been completed for now (no licences are now available). This environment can be stopped. 
25-Nov-2024: Upgrade done. Migrated Inventor data testing is in-progress.
12-Nov-2024: Upgrade path should be finalised this week - the team are thinking that there should be no further rollbacks now.
04-Nov-2024: Team are needing to rollback the clone very frequently - this is taking a long time because we''re reliant on Atos doing this.
Infra. will check with Atos whether the PLM team can have control of this.
21-Oct-2024: Infra. have installed 21x and handed over to the Initiative Team for the PoC and also Infra team today modified the uptime schedule for this environment as per the latest requirement from the Initiative team.
30-Sep-2024: Has the handover session been done?
The problem with the Inventor Integration persists.
23-Sep-2024: Handover in-progress from project team to Infra. 
There is a problem with the Inventor integration. 
09-Sep-2024: No-one from PLM team is using the server. Continuing to be used by the KU to explore 24x.
Uptime schedule to be implemented (standard 04:00 - 20:00 CET Mon-Fri planned)
12-Aug-2024: Testing continues. Opened up to KU for testing. Will look for license extension to allow testing to continue.
5-Aug-2024: Testing continuing. No issues. Licenses available until 22nd Aug
22-Jul-2024: Testing continuing. No issues.
15-Jul-2024: Hasan has started testing on 24x
02-Jul-2024: Looking to start testing next week - FR3.9 taking priority this week.
25-Jun-2024: Functional testing about to start - expected to start next week.
11-Jun-2024: Everything installed. Starting to export some data for import to 24x and for testing to start.
04-Jun-2024: Handed over to the 24X Vanilla Installation team. Installation in progress. 
28-May-2024: issues under control. Ready for installation/handover. 
Test PC: OVO-6GZJ2XMXSFR
21-May-2024: New environment setup and planned to be handed over to 24x upgrade team team this week to commence 24x OOTB install', 'N/A', 'https://air24xootb3dspace.atlascopco.group/', FALSE),
('875dd170-9df5-4806-abda-43b50b807086', 2, 'Implementation Development 1', 'BAU Support (Dev and Unit Testing)', 'Pavan Gude', 'Monday to Friday (Daily) 
05:00 AM CET until 19:00 PM CET', 'GEMS development until upgrade activity on QA', 'Till August 2026 : SBOM team
Data correction Team', NULL, '27-Nov-2025 - FR-4.2 Deployment successfully.
''20-Oct-2025: Cloning activity deferred until 06 Nov.
''17-Oct-2025 : Configuration /cloning is in progress on new Window11 reference to 2024x.
''07-10-2025 - Pavan need to confirm today
''23-Jun-2025: Atos repair 0026 (Jobserver) VM unsuccessful. VM remains stopped unless required.
''23-Jun-2025: 0026 (Jobserver) VM currently stopped due to a OS issue. Atos scheduled to reattempt repair 24 June.
21-Apr-2025: Domain account testing completed successfully.
''24-Mar-2025: Domain account continuing, but development are getting using when running pipeline - working with Harshad to make sure development work continues.
''17-Mar-2025: Domain account work in-progress on this environment. Harshad to connect with Pavan to make sure that the work isn''t impacting the development.
TLS change will be made by IT tomorrow - should have no impact on the environment.
''14-Mar-2025: VM restart required to this environment planned 18-Mar. Should not be more than 1 hour outage required. This is for TLS disablement. Regression testing required after.
09-Dec-2024: Back to normal weekend shutdown schedule.
02-Dec-2024 (BG): Arjun requested that this environment uptime schedule was changed to be up over weekend of 29 Nov/01 Dec. This has been modified accordingly by Harsha (FVX-45823)
21-Aug-2024 (BG): Confirmed with Harsha new uptime schedule is implemented.
Environment will be needed the coming 3 weekends for BPCS.
12-Aug-2024: Krishna confirmed that this env won''t be used for the Vault decommissioning.
5-Aug-2024 - Krishna to confirm if he plans to use this instance for Be2Net links update for Vault decommissioning.
29-Jul-2024: Infra. are proposing to shutdown the env overnight daily - this is approved by the team.
22-Jul-2024: July sprint activities continuing. Also being used by the BPCS Redesign as it XPDM adaptors on it.
09-Jul-2024: July Sprint activities started.
05-Jun-2024: June sprint activities.
28-May-2024: May sprint activities
21-May-2024: 2021x customisation will move to Implementation Development 2.
14-May-2024: Now also being used by the 2021x customisation initiative - do we need a new env for this activity?
21-Dec-2023: Request has come in to use this environment for SAP MDG/GEMS  development. Pending conformation
13-Nov-2023: Uptime timings to be updated (should be Fri 09:00 IST - Fri 23:30 IST ).
This environment is also known as customization dev', 'Always Last Release +1', 'https://air3dspacedev124x.atlascopco.group/', FALSE),
('a9f168c1-623d-4d2b-ac0c-db4517021a29', 3, 'Implementation Development 2 (previously known as Integration)', 'Non PLM Template development activities', 'Pavan Gude', 'Monday to Friday (Daily) 
05:00 AM CET until 19:00 PM CET', 'P&O Phase 2 team', 'Test automation and jobserver team and Devlopment team', NULL, '07-Oct-2025 : Priority 1 set to PLM Template Dev & Unit testing until Dev1 cloning is completed.
''18-Aug-2025 - As per Arjun''s request we are changing schedule for this platform.
''02-Jun-2025: 24x Upgrade team will be starting to use this environment from next week.
''14-Apr-2025: Environment now available for the 24x team. 
Renamed to Implementation Development 3 (24x Upgrade).
''07-Apr-2025: Will now be assigned to the 24x Upgrade environment: will be needed by the 18th April.
''24-Mar-2025: PLM GEMS Integration not actively using the development env
''17-Mar-2025: PLM GEMS Integration moving to Integration.
''10-Mar-2025: PowerBI development has already started using the env. PLM Template - Data team will start to use a development environment. PLM GEMS Integration and IAT BoM in PLM are expected to move in the next week.
''10-Feb-2025: As part of the development environment review it was decided that integration can be performed on the Testing environment, so this environment isn''t required.
However, given that this environment is a closer match to Implementation Development 1, it''s proposed to move Implementation Development 2 to this environment.
''27-Jan-2025: To be used for FR  3.15 deployment this week.
''25-Nov-2024: New Azure DevOps has been installed here and the deployment is being tested.
''04-Nov-2024: No longer required by the BPCS Redesign team.
''09-Sep-2024: Being used by BPCS Redesign team as a required component is not installed on Implementation Development 1 [Pavan to check, as should be using Implementation Development 1]
''2-Sep-2024: Downtime schedule implemented
''26-Aug-2024: Nightly shutdown can be initiated.
12-Aug-2024: Ben to confirm whether the shutdown timings have been updated.
''5-Aug-24: Approved by team about the downtime schedule.
''29-Jul-2024: Infra. haven''t suggested the overnight shutdown on this env - Pavan to check.
09-Jul-2024: Now in constant use as part of DevOps pipeline: new uptime requested: 04:00 until 00:00 CET 7 days
25-Jun-2024: Set-up completed and will be used for June sprint.
18-Jun-2024: Manual deployments now set-up, but there are some automated deployment failures. May need Infra''s help to get this working. Aim is still to get this use for the June Sprint.
11-Jun-2024: Automated deployments now up-to-date. Setting up the manual deployments so can be used in June Sprint.
25-May-2024: Validation to see if Integration is in line with latest deployments.
21-May-2024: Will set up for FR3.8, but will target FR3.9 as the first integration FR release.
14-May-2024: Not frequently used, but given the number of different Initiatives now running, this needs to be used consistently.', 'Always Last Release +1', 'https://air3dspacedev2.atlascopco.group/', FALSE),
('c82b1d0b-d7c7-4609-9b03-9268c5c56bbc', 4, 'Testing', 'PLM Template UAT
Package deployment testing. Both functional and technical testing.
Connected to Test BPCS', 'Pavan Gude', 'Monday to Saturday (Daily) 
05:00 until 20:00 (CET)', 'GEMS UAT Integration Team till 20 September
Data Correction team', NULL, NULL, '20-May-2026 - TESTING Env Deployment HF-4.7.1
''27-March-2026 - TESTING Env Deployment FR-4.6
''13-March-2026 - TESTING Env Deployment HF-4.5.2
''27-Feb-2026 - TESTING Env Deployment FR-4.5
''27-Nov-2025 - TRAIN Env 24x cloning and Application configuration is completed-Release env for PLM Project team.
''17-Oct-2025 - Cloning of Test (24x Upgrade)
''07-10-2025 : 17th Oct Cloning of Test (24x upgrade)
''11-Aug-2025 -HF3.21.1 Template UAT remains in progress.
''29-Jul-2025: Pavan planning HF3.21.1  deployment on Test, communication will be sent to Infra team.(Planned on 04/08/2025)
''02-Jun-2025: Pavan config Test environment as QA and importing users along with assigned licenses
''21-Apr-2025: Continues to be used this week for FR3.18. No other specific uses this week.
''14-Apr-2025: FR 3.18 to be deployed this week.
''24-Mar-2025: Uptime schedule changed 24*7 to accommodate the BPCS Hypercare work - can be reverted back to the normal schedule.
''20-Mar-2025: At the request of the BPCS Redesign team  (HF 3.16.3) the uptime schedule has been temporarily removed and TEST is currently running 24/7.
''17-Mar-2025: FR 3.17 moving to Test this week.
PLM GEMS Integration request the downtime schedule to be removed for the start of this week - can be turned back on  Thursday.
TLS change will be made by IT tomorrow - should have no impact on the environment.
''14-Mar-2025: VM restart required to this environment planned 18-Mar. Should not be more than 1 hour outage required. This is for TLS disablement. Regression testing required after.
''10-Mar-2025: HF 3.16.2 in test this week. SAP PO interface has moved from QA to Test in anticipation of the QA Refresh.
''24-Feb-2025: FR3.16 System Testing should finish today (but may be required during the week if further fixes required from UAT).
Index Tuning (Security Context Cleanup) - testing done but not successful.
''17-Feb-2025: FR 3.16 will be moved to Test this week of System Testing.
27-Jan-2025: FR 3.15 will continue to be tested this week. PLM GEMS Integration has moved code to here to start testing with this week.
''20-Jan-2025: FR 3.15 testing planned for this week. 
Indexing Tuning test will happen if a fix from the Impl. received this week.
PLM GEMS Integration likely to require the environment next week.
''13-Jan-2025: Hotfix testing planned for start of week. PLM GEMS Integration will be using test later in the week. Indexing tuning testing currently on hold, awaiting a fix, but testing due to continue.
''06-Dec-2025: Paul confirmed that PLM GEMS Integration would continue to need the Testing environment for the work that is being started in Jan. Surya will be using the environment to test the security context cleanup (for Index Tuning).
09-Dec-2024: FR-3.14 testing completed last week. Will move to QA this week.
''02-Dec-2024: FR-3.14 to be moved to Testing this week. PLM GEMS Integration work is part of 3.14 so will not be disturbed by the BAU Support - Build testing.
''04-Nov-2024: Will be used for Functional Release testing this week, now that the temp Spinner license is available.
''21-Oct-2024: BPCS Redesign now on QA. PLM GEMS Integration planning to move to QA this week.
''30-Sep-2024: BPCS Redesign will continue to use Test. BAU Support - Build are moving to QA this week.
''21-Sep-2024: BPCS Redesign will be continuing to use Testing; FR 3.12 will be deployed on the env this week for System Testing.
''16-Sep-2024: Infra team has checked/resolved uptime schedule in Azure and env is as per schedule in column H.
''16-Sep-2024: Still an issue with the automated shutdowns - the Test Env. is shutting down still at the weekend - Infra. team to double check schedule.
09-Sep-2024: Priority given to BPCS Redesign this week.
''26-Aug-2024: Confirmation for overnight shutdown pending.  
19-Aug-2024: Will be used for FR 3.11 Testing this week.
''12-Aug-2024: Used for HF last week. No plans for HF testing this week.
''5-Aug-2024: FR3.10 deployed to Production. HF''s if any will be tested in Test/QA during this week.
''29-Jul-2024: FR3.10 tested successfully last week. Will move to QA this week.
''22-Jul-2024: Will be used for FR3.10 this week.
''16-Jul-2024: Mainly GEMS Integration this week. No HF''s planned.
''09-Jul-2024: FR 3.9 Hot Fix testing. HF 3.9.1 released yesterday. HF 3.9.2 planned for today - issues identified before FR 3.9 but decided to release as a HF. Another HF planned for next week.
''02-Jul-2024: FR3.9 completed Test yesterday, so will only need the env for any retest if required.
25-Jun-2024: FR 3.9 moved to Test this week.
18-Jun-2024: No hot fixes planned for this week. UTF moved to QA.
11-Jun-2024: Testing for HF3.8.2 performed this week.
04-Jun-2024: Testing for HF3.8.1 and HF3.8.2. 
28-May-2024: Testing finished for FR3.8. STEP file will move to QA for testing. 
Apache changes for widgets. FVX-38425
''21-May-2024: UTF PLM Onboarding still using the Test environment, but FR3.8 will take priority.
14-May-2024: Currently being used by UTF PLM Onboarding for initial migration testing. GEMS Integration (MDG) planning to move this week for testing. There is no conflict between the two.
26-Mar-2024: For this week GEMS Integration is using Testing on priority because QA is not available (Full Indexing test)', 'FR-4.10', 'https://air3dspacetst24x.atlascopco.group/', FALSE),
('341bbf90-155c-44c0-a0fd-aa7382cfd3b6', 5, 'Training', 'User training environment.
Connected to GEMS Test
Inventor Upgrade 25x', 'Stefaan Boel', 'On demand
Currently Stopped', NULL, NULL, NULL, '14-April-2026 - FR-4.6 deployment done successfully
''07-April-2026 - HF-4.5.3 deployment done successfully
''25-March-2026 - HF-4.5.2 deployment done successfully
''09-March-2026: FR-4.5 deployment done successfully
09-March-2026: HF-4.5.1 deployment done successfully
''24-Feb-2026: HF-4.4.1 deployment done successfully
''13-Feb-2026: FR-4.4 deployment done successfully
''18-Dec-2025 - FR-4.2 + HF-4.2.1 Deployment successfully.
''22-Oct-2025: Decided/Agreed to stop TRAIN until 24x cloning/upgrade is completed.
20-Oct-2025: 24x Cloning/Upgrade deferred to start 30 Oct.
10-Sep-2025 -DevOps FR Deployment tested successfully.
25-Aug-2025 : Heena requested to Govid N for User activation IAT Data user (Migration 99 users)
''20-Jun-2025: Infra team (Surya) to bring Train up to date to latest release (FR 3.20 & HF 3.20.1)
''16-Jun-2025: IAT variant management training priority clarification pending
''10-Jun-2025: No change to priorities
02-Jun-2025: Being used for PLM GEMS UAT
19-May-2025: IAT Variant Mgt. training continuing for Gecia users
''27-Jan-2025: IAT Variant Mgt. training continuing.
''20-Jan-2025: IAT Variant Mgt. is progressing.
''13-Jan-2024: UTF training happened last week - no further training required on this.
No on-going training known.
''06-Jan-2025: One of the UTF training days has been moved to the 08-Jan. 
09-Dec-2024: UTF training expected next week (18-19 Dec) - GEMS integration will need to be working before then.
''25-Nov-2024: IAT are using the environment for their Variant Mgt. testing
''11-Nov-2024: Stefaan to check with IAT if they are still using this environment.
''30-Sep-2024: Devops Update team are testing today (there was Training planned last week)
''23-Sep-2024: DevOps Update team are planning to use the environment for testing on the 25-Sep. This will mean that the environment will be left at 3.12.
16-Sep-2024: Aiming to use this Env for the refresh training this week.
DevOps Update looking to use the environment for testing the CI/CD process on a multi-server env (25-Sep onwards?)
12-Sep-2024: Uptime schedule implemented by Harsha following check with Stefaan on this.
''9-Sep-2024: Training Environment needs to be available for onsite CATIA training from 23/9 till 27/9.
''2-Sep-2024 - Training will be available full time during the weekdays(Mon- Fri)
''26-Aug-2024: Confirmation for overnight shutdown pending. 
''19-Aug-2024: Training updated to FR 3.10.2 last week. HF 3.10.3 to be d1eployed.
''12-Aug-2024: FR 3.10 planned for today. Widget updates to follow. Being used by IAT for training/testing this week - being informed by Teams when the downtime is required.
''5-Aug-2024 - FR3.10 to be planned for deployment.
''22-Jul-2024: IAT continues to use for VM
''25-Jun-2024: NLY Variant Mgt. training being performed. UTF now moved wholly to UAT.
18-Jun-2024: Proximity Group changes did help with performance: some Inventor assemblies were loading quicker, though not all - in line with what was seen on QA and Prod.
11-Jun-2024: Proximity Group changes performed to ensure entire platform in the same group. Testing ongoing to check to see if there has been any performance improvement.
04-Jun-2024: UTF PLM Onboarding using for Functional set-up. IAT team are using for milestone 2 testing/preparation (150% BoM testing).
21-May-2024: Env to be set-up for IAT training (IAT Data team looking into this). Variant Mgt. still planned and UTF continuing to use env.
15-May-2024: Variant Mgt. are planning to do further training. IAT are requesting access so that they can do training. UTF continuing to use for the Functional Workshops.
09-Apr-2024: URL to be changer', 'FR-4.6', 'https://air3dspacetrn24x.atlascopco.group', FALSE),
('042c2abb-1632-40aa-bc74-ed9b76a44414', 6, 'QA (Staging)', 'User Acceptance testing. Performance testing.
Roll-out to production preparation', 'Stefaan Boel', 'Monday to Saturday (Daily) 
03:00 until 20:00 (CET)', 'FR-4.10 UAT and data changes 
GEMS Integration setup Testing', 'Kafka Integration for material - (Until end of oct 2026)', NULL, '17-Aug-2026 : FR-4.10 QA deploymnet successfully''
''06-Aug-2026 : HF-4.9.4 QA deploymnet successfully''
''04-Aug-2026: QA shutdown time will increase on 4 August and 6 August (Time 12:00 AM CET)''
''04-Aug-2026 : FR-4.10 QA deploymnet successfully''
''29-July-2026 : HF-4.9.2 QA deploymnet successfully''
''21-July-2026 : HF-4.9.1 QA deploymnet successfully''
''06-July-2026 : HF-4.9 QA deploymnet successfully''
''23-June-2026 : HF-4.8.2 QA deploymnet successfully''
''19-June-2026 : HF-4.8.1 QA deploymnet successfully''
''16-June-2026 : HF-4.8.1 QA deploymnet successfully''
''08-June-2026 : FR-4.8 QA Deployment successfully''
''20-May-2026 : HF-4.7.1 QA Deployment successfully''
''07-May-2026 : FR-4.7 QA Deployment successfully''
''17-April-2026 : HF-4.6.1 QA Deployment successfully''
''02-April-2026 : FR-4.6 QA Deployment successfully''
''02-April-2026 : HF-4.5.3 QA Deployment successfully''
''13-Mar-2026 : HF-4.5.2 QA Deployment successfully''
''10-March-2026'' - HF-4.5.1 QA Deployment successfully
'' 02-Mar-2026 : FR-4.5 QA Deployment successfully''
'' 18 -Feb -2026 : HF-4.4.1 QA Deployment successfully''
'' 17-Feb -2026 : PROD dump is refereshed on QA on 17 Feb 2026
''05-Feb-2026 - FR-4.4 QA Deployment successfully.(Via Pipeline-> Component: DataModel))
''30-Jan-2026 - FR-4.4 QA Deployment successfully.(Via Pipeline)
''30-Jan-2026 - HF-4.3.4 QA Deployment successfully.
''29-Jan-2026 - HF-4.3.4 QA Deployment successfully.
''Jan-2026 - HF-4.3.3 QA Deployment successfully (Via Pipeline).
''29-Jan-2026 - HF-4.3.4 QA Deployment successfully.
''23-Jan-2026 - HF-4.3.3 QA Deployment successfully (Via Pipeline).
''22-Jan-2026 - HF-4.3.3 QA Deployment successfully.
''20-Jan-2026 - HF-4.3.2 QA Deployment successfully.
''13-Jan-2026: 
Update 1: QA downtime required 14 Jan to support Gecia Azure FCS setup 15:00 to 17:00 CET.
Update 2: SBOM project testing from 26 Jan. QA refresh required before. QA refresh period scheduled for 22 to 25 Jan.
''19-Dec-2025 : SSO Enabled by Bhakti Vora.
''17-Dec-2025 - FR4.2.1+ PnO Deployment successfully.
''21-Nov-2025 - FR PnO Migration Deployment successfully.
''17-11-2025 :Tomorrow 10 AM CET will be avaialble for project teams
''31-10-2025 : Shutting down the below secondary VMs of all services on weekends from  20:00 PM CET to 4:00 AM CET.  
AIASNLAS0047
AIASNLAS0052
AIASNLAS0049 
AIASNLAS0043 
AIASNLAS0044 
AIASNLAS0068
AIASNLAS0066
AIASNLAS0070
''20-Oct-2025: QA assigned to FR 4.1 UAT in absence of TEST.
22-Sep-2025: GEMS Handshake UAT now added as priority 1. From 29 Sep Heena looking to access QA for data script testing on 24x.
''02-Jun-2025: QA now 100% allocated to R2024x upgrade activity
21-Apr-2025:
- Will be primarily used for FR3.18 this week.
- PLM GEMS Handshake continues to use, but there should be no conflict.
- 3DPlay Geometry updates testing planned for next week.
''14-Apr-2025:
- PLM GEMS Handshake are planning to use on Wed.
- IAT BoM in PLM using Mon-Wed.
- No other specific usage this week.
''24-Mar-2025:
- FR 3.17 UAT
- Dynatrace testing with Integrations planned for Tuesday
- BPCS Redesign testing (HF 3.16.3 to be included FR 3.17)
''17-Mar-2025: QA Refresh in-progress. Plan is to complete Wednesday and have system available by Thursday. 
HF3.16.3, deployment on Thursday (in case refresh is finished).
10-Mar-2025: Infra. to confirm exact timing on the QA Refresh. 
Development team request availability of the QA env until tomorrow (EOD) for HF 3.16.2 testing (this is the priority this week).
next: QA down 10-14th of March BPCS link to moved to TST
''24-Feb-2025:
- BAU Support - Build UAT will be done this week
- IAT BoM in PLM - Matt to check with Gopi whether this has completed
- Data Correction deployments will continue this week
- Be2Net App changes - may still be required, but low priority
- PLM GEMS Handshake MDG - Matt to check with Paul
- Dynatrace PoC - HIP fixes to be tested/monitored this week. 
''17-Feb-2025:
- IAT BoM in PLM UAT (all week) - requires env. to be up during working hours
- Data Correction deployments and testing (done out-of-office hours)
- Be2Net app. changes
- PLM GEMS Handshake MDG testing
- Dynatrace troubleshooting
- P&O Initiative scripts - not clear on what will actually be required.

Infra. team to raise notice if any of the Dynatrace and/or P&O Initiative scripts need to cause the system to be offline. Aim to run any work during CET lunchtime.
''10-Feb-2025:
NOTE: It''s patching week so QA will be down for part of Thursday.
- CTS Training (Monday only)
- UAT BoM in PLM UAT (all week)
- Data Correction deployments and testing (done out-of-office hours)
- BQR BPCS Handshake UAT
- Be2Net app. changes
- PLM GEMS Handshake MDG testing
- Dynatrace troubleshooting
- P&O Initiative scripts to be run [QA down] - first script ran for 2.5 days but hasn''t completed - project team is aware, and will need to replan their activities.
''05-Feb-2025: Update from Stefaan that QA is required available 10 Feb for training sessions.
''27-Jan-2025: FR 3.15 will be deployed this week and UAT performed.
BPCS Redesign development / testing will continue this week.
''20-Jan-2025: All previous uses are still on-going.
Dynatrace is now on QA and the issues have been resolved.
BPCS Redesign end-to-end and UAT planned for this week. 
Be2Net application changes are also being tested via QA this week (will be done as part of FR 3.15)
''13-Jan-2025: Hotfix testing will be necessary at the start of the week. 
Further PLM SAP Handshake testing will be necessary for SAP team developments.
Performance Testing: Dynatrace Testing; Inventor loading performance testing;
''06-Jan-2025: Full-indexing completed in Dec-24, along with the Bookmark fix: no further work required here. Search issue testing to be performed (Sandeep). Heena to liaise with Functional Team and then KU to check whether the Bookmark fix has worked.
''09-Dec-2024: GEMS Integration testing to continue to end of this week.
FR3.14 UAT planning for this week. Request is to have downtime in the morning to support the GEMS testing - though today the FR-3.14 deployment is planned for 15:30 - 17:00 CET.
''02-Dec-2024: Houston and Wuxi FCS to moved this week. Notice will be provided via Teams.
''11-Nov-2024: PLM GEMS Integration is now priority after last week''s FR UAT.
''04-Nov-2024: Functional Release UAT to be moved to QA on Tue 05-Nov. Will be priority for this week.
''21-Oct-2024: PLM GEMS Integration will move to QA this week and take priority over BAU Support - Build activities.
''30-Sep-2024: BPCS Redesign and BAU Support - Build are in UAT this week.
''23-Sep-2024: BPCS Redesign will start on the 25-Sep and will go-on for 2-3 weeks.
FR 3.12 will need to be deployed for UAT.
16-Sep-2024: Indexing performance test completed last week. Summary to be put together, but generally quicker than previously. Need to calculate whether the reindexing can be completed over a weekend.
BPCS Redesign code to be deployed this Thursday and UAT to be performed next week.
''09-Sep-2024: QA being used for the Indexing performance retest: not running as expected over the week - this is being investigated and an update will be provided by the Infra. team.
''2-Sep-2024 - QA will be available full time (Mon- Sun). Plan to use QA for full indexing from 5-Sep(to be confirmed). To be checked with Arjun for impacts.
''26-Aug-2024: Confirmation for overnight shutdown pending. 
FR3.11 will move to QA on 27th for UAT.
''19-Aug-2024: Full indexing in-progress. Status to be reviewed today.
On the 21-Aug-2024 Walker Filtration plan a refresh training.
BPCS Redesign QA resizing being planned.
''12-Aug-2024: Full-indexing to be planned this week. Bookmark data correction to be deployed in conjunction with the Full-Indexing to test that correction before deployment to Production. Heena to liaise with Ben on this.
On the 21-Aug-2024 Walker Filtration plan a refresh training.
''5-Aug-2024: FR3.10 deployed to Production. HF''s if any will be tested in Test/QA during this week. Full indexing to be planned next week.
''29-Jul-2024: Will be used for FR3.10 UAT this week.
''22-Jul-2024: Infra. are performance testing, and Data are using it for Data Correction testing.
''16-Jul-2024: QA Refresh in-progress. On-track as of today.
''09-Jul-2024:
- BAU Support - Build (FR 3.9 HF''s)
- Data correction testing
- Be2Net Refresh testing
- UTF may use, but not vital
QA refresh planned to start on Thursday (11-Jul). Will depend on the Be2Net testing. (Production env back-up taken on Sat 05-Jul-2024)
''02-Jul-2024: 
- BAU Support - Build (FR3.9) priority this week. Key Vault set-up on QA for 2021x Decustomisation (part of FR3.9)
- UTF PLM Onboarding still in-progress - Gopi trying to get an updated timeline from UTF KU
''25-Jun-2024:
- UTF PLM Onboarding priority this week.
- Data Correction testing.
- Development will move FR3.9 on Friday if System Testing successful.
- Infra. team may need access to QA to perform RCA''s - will try to give a day''s notice on this activity.
''18-Jun-2024:
- UTF PLM Onboarding priority this week.
- Infra. working with the 21x Decustomisation team to agree on the testing plan for the Apache Load Balancer load testing.
- Data Correction testing.
11-May-2024:
- Testing for HF3.8.2
- UTF PLM Onboarding Dry-Run to commence this week
- Data Correction testing
''04-May-2024: 
- Testing for HF3.8.1 and HF3.8.2. 
- DF3.6.1 for EIN data correction for Be2NET. 
- UTF PLM Boarding Dry Run. 
- Wed morning for session with DS on TidyVault
''28-May-2024: UAT for FR3.8. Data corrections on Sunday.
''21-May-2024: No training planned for this week. No changes to priority
15-May-2024: No training planned at the moment (how do we move the training to the Training env?!). 
Planned for UTF PLM Onboarding next week.
09-Mar-2024: Full Indexing completed and taken off the priority list.
''26-Mar-2024: Full Indexing is taking priority. Forecast is that it will take all week to get this completed, but the forecast will be updated daily during the week.
GEMS Integration will need QA once it''s available. They are looking for a week testing; they should be able to run in parallel with the BAU Support FR testing.', 'FR-4.10', 'https://air3dspaceqa.atlascopco.group/', FALSE),
('bd9e760d-09ee-4387-94e3-27a9fb4a8dc0', 7, 'Production Data Migration', 'Infrastructure for performing the production data migration & correction activities', 'Tom Slegers', 'Monday to Friday (Daily) 
05:00 until 00:00 (CET)', 'IAT BoM in PLM', NULL, NULL, '17-Oct-2025 : New Win11 servers ready for Data team to use. Decom initiated for AIASNLAS0130 and  AIASNLAS0138 as agreed with Data team this week.
''13-Sep-2025 : Sheetal confirmed uptime still required.(out of 5  - 2 VM''s shutdown AIASNLAS0130 / AIASNLAS0138 and 3 VM''s are active AIASNLAS0059, AIASNLAS0125 and AIASNLAS0011 )
''30-Jun-2025: Heena to confirm the uptime schedule that is required for the IAT BoM in PLM data team
''16-Jun-2025: Confirmed by Gopi environment is still required for IAT BoM in PLM work however awaiting update uptime schedule requirements
''10-Jun-2025: Priority to be checked with Gopi whether environment is still required for IAT BoM in PLM work
''07-Apr-2025: Network issues have now gone away.
''24-Mar-2025: Network issues have gone away, but two of the worker machines are no longer available. Infra. will investigate.
''17-Mar-2025: There are performance issues (just getting onto the systems) with the Data Migration workers. Appears to be any issue with network connections - Infra. team will support if there is a problem.
''17-Feb-2025: Only being used by the IAT BoM in PLM project. Sponsor to be changed to Gopi.
''10-Feb-2025: Unused servers have been identified and decommissioned. There are a number of servers that have been left to perform the UAT BoM in PLM work.
''20-Jan-2025: Review of further infra decommissioning in-progress.
''06-Jan-2025: Matt and Harsha to review the migration machine decommissioning list and check if there are any further machines that can be decommissioned.
09-Dec-2024: Confirmed last week which of the Migration Development machines can be decommissioned - this is now in progress.
''11-Nov-2024: IAT PLM Onboarding data migration is concluding, but further IAT BoM in PLM BoM imports will be required - need to confirm if this environment will be used for that.
''26-Aug-2024: X4U workers decommissioned apart from one that is provided to Arjun.
''12-Aug-2024: Awaiting Ilse''s confirmation for the X4U workers? Ben to check with Harsha.
IAT planning to use until the 15th Sept. 
29-Jul-2024: X4U team have given Infra. a list of those machines that are no longer used and can be decommissioned.', 'N/A', NULL, FALSE),
('9aa2b239-5c0e-40d6-a4d6-a8f4080974d9', 8, 'Production', 'Live operational system', 'Ilse Roegies', '24 x 7 Uptime', 'PLM Production Usage', 'Data corrections
Kafaka Integration for material go-live(mid of august)', NULL, '03-Oct-2026 : FR-4.12 Production deploymnet successfully''
''12-Sep-2026 : HF-4.11.2 Production deploymnet successfully''
''07-Sep-2026 : HF-4.11.1 Production deploymnet successfully''
''05-Sep-2026 : FR-4.11 Production deploymnet successfully''
''15-Aug-2026 : HF-4.10.1 Production deploymnet successfully''
''08-Aug-2026 : FR-4.10 Production deploymnet successfully''
''06-Aug-2026 : HF-4.9.2 Production deploymnet successfully''
''29-July-2026 : HF-4.9.2 Production deploymnet successfully''
''07-July-2026 : HF-4.9.2 Production Deployment successfully''
''07-July-2026 : HF-4.9 Production Deployment successfully''
''27-June-2026 : HF-4.8.2 Production Deployment successfully''
''20-June-2026 : HF-4.8.1 Production Deployment successfully''
''17-June-2026 : HF-4.8.1 Production Deployment successfully''
''13-June-2026 : FR-4.8 Production Deployment successfully''
''23-May-2026 : HF-4.7.1 Production Deployment successfully''
''23-May-2026 : HF-4.7.1 Production Deployment successfully''
''16-May-2026 : HR-4.7 Production Deployment successfully''
''17-April-2026 : HF-4.6.1 Production Deployment successfully''
''11-April-2026'' - FR-4.6 Production Deployment successfully
''04-April-2026'' - HF-4.5.3 Production Deployment successfully
''15-March-2026'' - HF-4.5.2 Production Deployment successfully
''10-March-2026'' - HF-4.5.1 Production Deployment successfully
''07-March-2026'' - FR-4.5 Production Deployment successfully
''21-Feb-2026 - HF-4.4.1 Production Deployment successfully
''7-Feb-2026 - FR-4.4 Production Deployment successfully
''31-Jan-2026 - HF-4.3.4 Production Deployment successfully
''24-Jan-2026 - HF-4.3.3 Production Deployment successfully
''21-Jan-2026 - HF-4.3.2 Production Deployment successfully.
''22-Dec-2025 - P&O Migration Deployment planned
19-Dec-2025 : Production down due to P&O Migration by Arjun Kulkarni.
''29-Nov-2025 - FR-4.2 Deployment successfully.
''02-Oct-2025 : 3DX  is planned  for major version upgrade to 24x
11-Aug-2025 : HF 3.21.1 is on HOLD
''29-Jul-2025: HF 3.21.1 deployment still planned for 09/08 (On Hold on 07/08)
''29-Jul-2025: Pavan planning HF3.21.1 deployment on Prod ,communication will be sent to Infra team.(Planned on 09/08/2025)
''19-Jul-2025: FR 3.21 was deployed 19 Jul
''30-Jun-2025: HF 3.20.1 was deployed 28 Jun
''23-Jun-2025: FR 3.20 was deployed 21 Jun
''10-Jun-2025: HF 3.19.3 was deployed 06 Jun
''02-Jun-2025: HF 3.19.2 has been rolled out on production.
''21-Apr-2025: FR3.18 deployment planned for the weekend.
''14-Apr-2025: DSLS server transfer completed.
''07-Apr-2025: DSLS servers in-progress - planning to go-live next weekend (TBC)
25-Mar-2025: FR 3.17 planned for end of week. Performance testing baseline to be done Monday evening.
''17-Mar-2025: HF 3.16.3 planned for the end of the week.
''10-Mar-2025: HF 3.16.2 planned for this week. 
OS Patching planned for the weekend.
''24-Feb-2025: FR 3.16 planned for next weekend (including P&O Recommendations).
Do not deploy any Dynatrace changes to Production this weekend, so not to confuse any issues with the FR 3.16 deployment.
PDF status change also planned for this weekend - no code deployment, just a report that''s run. Pavan to liaise with Ben about the timing.
''17-Feb-2025: 3.15.2 deployed this morning to revert part of 3.15.1. 3.15.3 will be planned to be deployed later this week to redeploy the failed part of 3.15.1.

Partial Indexing delays of last week are being investigated.
10-Feb-2025: It''s patching week so Prod will  be down on Sunday.
''27-Jan-2025: 
FR 3.15 due for deployment on Saturday morning.
BPCS 801 data change to be done as part of FR 3.15
Dynatrace PoC went live on Production over last weekend.
''20-Jan-2025: A data change to resolve a BPCS 801 error code. To be done via a HF.
OS patching happened successfully over the weekend.
Functional Team are creating PLM team part data on Production to allow for consistent testing.
''13-Jan-2025: DB Server spikes still being seen - associated to XPDM. BPCS Redesign team are working on some changes here. No impact on users seen. PLM Team to continue to work to the processes from last year.
Patching on 19/01
''06-Jan-2025: Infra. team to review the DB server performance now that more users are back on the system after the Christmas holidays. PLM Team to continue to work to the previous process.
PLM GEMS Integration triggers need to be enabled for the 09-Jan-2025 (evening of the 08-Jan-2025) - this will require downtime (3DSpace restart) and a Hot Fix will be required. 
09-Dec-2024:  DB server performance continues to be stable, but being monitored. No changes to the system usage processes.
''02-Dec-2024: DB server performance continues to be stable, but being monitored - spikes last week were attributed to MQL sessions. Ben will set up a separate session to review this.
''25-Nov-2024: DB server performance continues to be stable, but being monitored. No changes to the system usage processes.
''18-Nov-2024: HF3.13.2 may be deployed at 17:00 CET on Tue 19-Nov. DB server performance continues to be stable, but being monitored. No changes to the system usage processes.
''11-Nov-2024: DB server performance has stabilised, but is still closely, so no changes to process at the moment.
''04-Nov-2024: DB server performance still a concern:
- XPDM processing seems to be another culprit
- LZ performance improved - but too early to say whether this has affected the DB
- New MQL usage methodology in force
''21-Oct-2024: DB server performance is a concern:
- MQL queries stopped during working day
- LZ performance improvements
- FCS maintenance tuning
''30-Sep-2024: DB server core count reduction performed successfully over the weekend. Performance to be monitored this week. 
FCS disk swap copy in progress after positive testing on QA last week. Will see if the change can be made as part of the FR release this weekend.
''23-Sep-2024: DB server core count reduction didn''t work and will need to be replanned.
FCS disk swap may be planned, depending on results of QA testing.
16-Sep-2024: DB server core count reduction being planned for next weekend
''09-Sep-2024: HF 3.11.1 deployed over the weekend.
IAT No-CAS3 server being used for QA Indexing, so are unable to perform their ad-hoc data migration requests - Infra team checking for an alternative. 
''26-Aug-2024: data corrections and the FR3.11.
''19-Aug-2024: 
- HF 3.10.3 deployed
- X4U Data correction activities continue
- IAT PLM Onboarding Data Migration continues (now planned for 15th Sept.)
- DS have requested that the Inventor loading performance test be performed on Production (they''re not seeing anything on QA traces). Will plan to perform this during this weekend''s maintenance window.
12-Aug-2024: 
- UTF PLM Onboarding migration completed
- X4U Data correction activities continue
- IAT PLM Onboarding Data Migration continues (now planned for 15th Sept.)
- HF 3.10.3 planned for next weekend.
16-Jul-2024:
- X4U Data Migration activities completed. No further migration planned.
- UTF PLM Onboarded completed (Go-Live meeting with UTF planned for Wed)
- IAT PLM Onboarding data migration in-progress.
09-Jul-2024:
- UTF PLM Onboarding aiming to start their data migration this week (have a conditional go from UTF team, but some source data corrections are required which don''t yet have timeline).
02-Jul-2024:
- UTF PLM Onboarding aiming to start their data migration next week (assuming UTF KU get their UAT completed this week).
------
- Production Data Migration in-progress', 'FR-4.12', 'https://air3dxspace.atlascopco.group/', FALSE),
('ab0eb6e0-fee0-480d-9acf-f7e531a17f7a', 9, 'DevOps QA', 'QA development environment', 'Ajay Shelke', NULL, 'BAU Support - Build', NULL, NULL, '27-Jan-2025: Decommissioning assessment completed and planned for Feb & Mar.
''25-Nov-2024: Should be able to be decommissioned, now that Azure DevOps has been implemented, but need to confirm that the Data team (or any others) have a dependency on the platform.
''12-Aug-2024: SonarQube could not be tested here, because it''s a Kubernetes platform. Identified one of the X4U migration workers to be used instead.
22-Jul-2024: SonarQube - code review tool to be tested here.
Can''t be used for the main part of the project because it can''t support the installation of 3DX.
''- To be replaced by Azure DevOps (date to be confirmed)', 'N/A', NULL, TRUE),
('f14e48c9-9089-468d-be77-577237d2a324', 10, 'DevOps Production', 'Production development environment', 'Ajay Shelke', NULL, 'BAU Support - Build', NULL, NULL, '- Replaced with Azure DevOps', 'N/A', NULL, TRUE),
('2754bad9-454b-4b9d-8c1d-89e534a825f5', 11, 'SandBox (Technical)', 'OOTB environment for use by the Technical Team', 'N/A', 'N/A', 'GEMS Integration', 'X4U Phase 1', NULL, '13-Nov-2023: Environment decommissioned', NULL, NULL, TRUE),
('dd21f126-d374-4f5d-ba19-0c081860da8e', 12, 'IAT Migration Development', 'Migration development for IAT project', 'Gopinath Karthikesan', 'Environment decommissioned
Monday 05:30 AM to Friday 19:00 PM', 'IAT PLM Onboarding', NULL, NULL, '14-May-2024: Confirmed by Infra team that this environment is now fully decommissioned
''26-Mar-2024: IAT have confirmed that this can now be decommissioned.', 'N/A', 'https://air3dspacedev321x.atlascopco.group/', TRUE),
('2309e2c5-d713-4149-bf18-baa53e53c6f0', 13, 'Migration Development', 'Migration development activities', 'Heena Ahirrao', 'Environment decommissioned
Monday to Sunday
04:00 AM until 00:00AM CET', NULL, NULL, NULL, '14-Apr-2025: Migration env decommissioning now completed.
07-Apr-2025: Decommissioning still in progress.
''21-Mar-2025: IAT BoM in PLM confirmed no longer using. Can be decommissioned.
''17-Mar-2025: Sheetal (IAT BoM in PLM) and Chetan have confirmed that they are not using this machine. Can we now decommission? Matt to set-up a separate session to confirm.
''10-Mar-2025: Pavan has created the new users, but hasn''t yet had confirmation from the IAT team - Sheetal returns from holiday tomorrow - Pavan will chase.
''24-Feb-2025: Pavan to create migration users on Integration before IAT BoM in PLM team will move.
''10-Feb-2025: Decommissioning agreed - IAT BoM in PLM will move to Integration.
''20-Jan-2025: Review of further infra decommissioning in-progress.
''06-Jan-2025: IAT PLM Onboarding migration has now completed - Matt and Harsha to review the migration machine decommissioning list and check if there are any further machines that can be decommissioned.
''09-Dec-2024: Confirmed last week which of the Migration Development machines can be decommissioned - this is now in progress.
''18-Nov-2024: Gopi confirmed last week that the IAT BoM in PLM team is still using this environment.
''28-Oct-2024: Update planned as part of the DevOps environment.
30-Sep-2024: IAT BoM in PLM team think that they don''t need the update, however the Data team think that it will be required. Pavan to investigate how and when this might be possible.
''21-Sep-2024: The X4U Migration Development, does get updated with latest FR''s. Gopi to check with the IAT BoM in PLM team to see if this will be a problem.
09-Sep-2024: IAT BoM in PLM planning to use  this env: will need to check whether this is possible since the Migration Development env doesn''t get updated [Heena to check with Pavan - keep Gopi informed]
2-Sep-2024: Downtime schedule implemented
''26-Aug-2024 Overnight shutdown will be set up this week. To be decided if we decommission it in September.
22-Jul-2024: X4U are not using this env. IAT have confirmed that they need to use this env until the end of August.
09-Jul-2024: X4U using for Data Correction testing - should not need it by the end of this week. Only IAT will be using this env.
14-May-2024: Used only by the X4U team intermittently for EDM and failed data migration fixes.', 'N/A', 'https://air3dspacedev221x.atlascopco.group/', TRUE),
('66e6a7c9-3df5-4161-8052-fe078947d54b', 14, '21x OOTB', 'OOTB environment to be used by BAU Support - Run to check default behaviour and reproduce issues', 'Shruti Vedasen', 'Environment decommissioned on 27 Oct 2025', NULL, NULL, NULL, '07-Oct-2025 : Confirmed by sponsor/stakeholders this environment can be decommissioned.
''07-10-2025 : Need to plan for Decom this Environment (Target date :8th Oct raise request to Decom)
''29-Sep-2025 : Shruti confirmed that this env can be Decom. Preference is after Go-Live
''04-Aug-2025: As planned previously this environment will be stopped providing there are no current further requirements to use it.
''30-Jun-2025: Sebastien updated that the 24x upgrade team require this environment running at the same uptime schedule until 21st July.
''16-Jun-2025: Sebastien confirmed 24x upgrade team still require this environment running at same uptime schedule until 23 June when this requirement can be reviewed again.
''10-Jun-2025: Sebastien to update if 24x upgrade team still require this environment
''02-Jun-2025: DS Support - Run OOTB issue testing
12-May-2025: Environment being rebuilt due to an issue identified during  24x upgrade analysis.
21-Apr-2025: 24x Project team have the information that they need for comparison. But do not stop the env yet, whilst the comparison is in-progress.
14-Apr-2025: Env has been started. 24x Upgrade team to confirm when the Spinner information has been extracted so the env can be stopped again.
07-Apr-2025: 24x Upgrade Project team will need this week for extracting Spinner information - will request for the env start.
17-Feb-2025: Environment is not stopped. Will be stopped now, for start on-demand.
10-Feb-2025: Testing has been completed. Infra. to confirm whether this environment has now been stopped, for start on-demand.
27-Jan-2025: Domain account testing expected to complete this week. Environment will be reverted to previous schedule then.
13-Jan-2024: Currently running for the domain account testing.
02-Dec-2024: Task on Backlog, but Environment will be stopped in the meantime.
25-Nov-2024: Task to be created with the Infra. team to get the env. reverted.
20-Nov-2024: Arjun confirmed via email to 3DX Environment Review team that ""DevOps team no longer needs this environment.� We can revert it back to required state."".
2-Sep-2024: Downtime agreed and implemented(00h00 CET - 4h00 CET)
22-Jul-2024: 
- Will now be used for the DevOps initiative until the end of October.
- The DevOps Initiative team will revert the env back to an OOTB Installation if required, within 2 days of request.', 'N/A', NULL, TRUE),
('57ae43f7-832a-420f-b8c4-f9d2e0a1aea4', 15, 'SandBox (Functional)', 'OOTB environment for use by the Functional Team', 'Jacky Joseph', 'Environment decommissioned on 27 Oct 2025', NULL, NULL, NULL, '17-Oct-2025 : Confirmed by sponsor/stakeholders this environment can be decommissioned.
''16-Jun-2025: Status unchanged, environment remains stopped.
02-Jun-2025: Environment currently stopped
24-Mar-2025: Env now stopped. KU are aware that they will need to request to get it started before using it.
17-Mar-2025: Functional team no longer need the environment. Sandeep is check with Peter Z whether he still needs the env - Sandeep to check Peter''s requirement to see if there''s a better env for him to use.
10-Mar-2025: Started for the moment for DS SR analysis. Expected only to need it for a day or two.
Peter Z also using the environment - Sandeep to check with him before getting it stopped again.
17-Feb-2025: Environment schedule to be changed so that this environment is Stopped by default and will be started-up on-demand.
18-Nov-2024: Inventor loading performance testing.
30-Sep-2024: Preference is to keep the Sandbox environment on 21x so that it can be used for Production support. An alternative may be to use the 24x OOTB environment, once the 24x SR''s have been created.
23-Sep-2024: There is a proposal to upgrade this environment to 24x for the Inventor 24 testing, but there is a question of what system could then be used for testing 3DX issues and creating SR''s. Sandeep to take offline with Stefaan to get an agreement on this.
21-Aug-2024: (BG) confirmed with Harsha new uptime schedule is implemented
12-Aug-2024: Ben to confirm whether the shutdown timings have been updated.
29-Jul-2024: Infra. Are proposing to shutdown the env overnight daily - this is approved by the team.
25-Jun-2024: Sandbox is now available.
18-Jun-2024: Sandbox is currently down - Infra. to check.
11-Jun-2024: Sandbox now available.
04-Jun-2024: Issue with the env DB - this is preventing Ticket analysis. Could use OOTB instead.', 'N/A', 'https://air3dspacesb221x.atlascopco.group', TRUE),
('b6a04fbb-b510-41c6-94cb-af34d16da167', 16, 'Implementation Development 2 (old)', 'Non PLM Template development activities', 'Pavan Gude', 'Environment decommissioned on 27 Oct 2025', NULL, NULL, NULL, '07-Oct-2025:  Confirmed by sponsor/stakeholders this environment can be decommissioned.
''29-Sep-2025 : - After Go-Live this env can Decom.
14Jul-2025: Pavan requested to remove  priority 3. No longer required .
07-Jul-2025: Pavan will check priority 2 and 3 with rest of Dev team to understand if it still required.
''30-Jun-2025: Priority clarification pending
''10-Jun-2025: Priority clarification pending
''21-Apr-2025: Now set-up for all non PLM Template activities.
''14-Apr-2025: Set-up has completed - Pavan looking to get confirmation from the teams that they have moved to this env.
''07-Apr-2025: 24x Upgrade team have checked and they cannot use this environment because there is no XPDM or Jobserver services.
Plan is to move PLM GEMS Integration, Power BI Report development, IAT PLM Onboarding and PLM Template (Data) activities back to Implementation Development 2.
Pavan will be moving the other projects to this environment.
''02-Apr-2025: Decom request cancelled at request of 24x upgrade project. Uptime schedule being checked with 24x upgrade team
''24-Mar-2025: Paul confirmed that this platform is no longer being used. Matt to request decommissioning to start.
''17-Mar-2025: Paul to confirm that development has now moved to the Integration env.
''10-Mar-2025: PLM GEMS Integration move to Integration is in-progress - expected to complete this week.
''24-Feb-2025: Decommissioning agreed and all work will be moved to the Integration environment (Pavan).
''10-Feb-2025: As part of the development environment review, it has been proposed to decommission this environment and move the development to the Integration environment, as that already has XPDM and Jobserver set-up, which this environment doesn''t.
''13-Jan-2025: Env restarted and work underway
''06-Jan-2025: PLM GEMS Integration work to start. Environment to be restarted.
09-Dec-2024: Environment will be needed in January (PLM GEMS Integration), but can be stopped for now.
''02-Dec-2024: Environment upgraded to last version last week. Can now be stopped.
''25-Nov-2024: Being used by the DevOps Upgrade team to make sure that the environment is up-to-date before it can be stopped.
There is a mounted drive that the PLM GEMS Integration team that links to the QA logs that would need to be made available somewhere else.
''18-Nov-2024: PLM GEMS Integration aren''t actively using this environment - but the testing is in progress so may be needed if an issue is found.
21-Oct-2024: Not being actively used at the moment, because most of the work is now on Test.
26-Aug-2024: Used for PLM GEMS Integration
12-Aug-2024: Arjun confirmed (via email) that there is no planned 2021x Decustomisation work on this env.
5-Aug-24: Approved by team about the downtime schedule.
29-Jul-2024: Infra. haven''t suggested the overnight shutdown on this env - Pavan to check.
22-Jul-2024: Will not be used for DevOps set-up.
16-Jul-2024: Now being used for the DevOps set-up initiative.
25-May-2024: GEMS/SAP + decustomisation team.
''21-May-2024: Confirmed with the GEMS Team that this can be used 2021x Decustomisation team. The work will be moved here.
14-May-2024: Still be being used by the SAP MDG/GEMS Integration. Unit Testing of MDG in-progress. Decision made to allocate 21x Decustomisation (to be confirmed with Indu Nair)', 'N/A', 'https://air3dspacedev421x.atlascopco.group/', TRUE);
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IG_EnvironmentOverviewTBL");
        }
    }
}
