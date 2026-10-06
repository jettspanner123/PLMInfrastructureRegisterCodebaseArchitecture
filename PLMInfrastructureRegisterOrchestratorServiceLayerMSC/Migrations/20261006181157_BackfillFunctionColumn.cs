using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations
{
    /// <inheritdoc />
    public partial class BackfillFunctionColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // One-time Function backfill, transcribed verbatim (trimmed only)
            // from the infrastructure register CSV's own FUNCTION column -
            // same mechanism as FixMissingEnvironmentTagBackfill, but with no
            // value normalization: unlike EnvironmentTag's small 17-tag
            // vocabulary, Function is free text with 130+ organic, often
            // one-off values, so there's no small controlled set to map onto.
            // Hostnames not present here (or not matched by any row) are left
            // untouched - Function stays NULL, which the UI already renders
            // as an em dash.
            migrationBuilder.Sql(@"
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod - EDAT Extractor' WHERE ""Hostname"" = 'AIASNLAS0003';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod - EDAT Importer' WHERE ""Hostname"" = 'AIASNLAS0004';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DX All-In-One Server' WHERE ""Hostname"" = 'AIASNLAS0006';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DX All-In-One Server' WHERE ""Hostname"" = 'AIASNLAS0007';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DX All-In-One Server' WHERE ""Hostname"" = 'AIASNLAS0008';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DX All-In-One Server' WHERE ""Hostname"" = 'AIASNLAS0009';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'CATIA Promigrate export client' WHERE ""Hostname"" = 'AIASNLAS0010';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'IAT BoM in PLM extractions' WHERE ""Hostname"" = 'AIASNLAS0011';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DX All-In-One Server' WHERE ""Hostname"" = 'AIASNLAS0014';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSearch,3DSpaceIndex,' WHERE ""Hostname"" = 'AIASNLAS0015';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Load Balancer' WHERE ""Hostname"" = 'AIASNLAS0016';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'FCS' WHERE ""Hostname"" = 'AIASNLAS0017';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSwym, Widget' WHERE ""Hostname"" = 'AIASNLAS0018';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DX All-In-One Server' WHERE ""Hostname"" = 'AIASNLAS0019';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DPassport,3DDashboard,3DComment,3DSpaceCAS,3DSpaceNOCAS' WHERE ""Hostname"" = 'AIASNLAS0020';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3dxgw, xpdmgw' WHERE ""Hostname"" = 'AIASNLAS0021';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Adaptor' WHERE ""Hostname"" = 'AIASNLAS0023';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Job Server' WHERE ""Hostname"" = 'AIASNLAS0026';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Client
Orchestrator' WHERE ""Hostname"" = 'AIASNLAS0027';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Job Server' WHERE ""Hostname"" = 'AIASNLAS0028';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Job Server' WHERE ""Hostname"" = 'AIASNLAS0029';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Adaptor' WHERE ""Hostname"" = 'AIASNLAS0030';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'PowerBI report developments
- Used for PoC development SQL database
- Power BI desktop client' WHERE ""Hostname"" = 'AIASNLAS0032';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Adapter' WHERE ""Hostname"" = 'AIASNLAS0033';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Clients' WHERE ""Hostname"" = 'AIASNLAS0034';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpaceCAS, 3DSpaceNOCAS' WHERE ""Hostname"" = 'AIASNLAS0036';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Load Balancer' WHERE ""Hostname"" = 'AIASNLAS0037';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3dxgw, xpdmgw' WHERE ""Hostname"" = 'AIASNLAS0038';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DX App Server (no 3DSpace)' WHERE ""Hostname"" = 'AIASNLAS0039';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace CAS 1' WHERE ""Hostname"" = 'AIASNLAS0040';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Central FCS 1, File Converter' WHERE ""Hostname"" = 'AIASNLAS0041';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Central FCS 2, File Converter' WHERE ""Hostname"" = 'AIASNLAS0042';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace No CAS 1, 3dxgw1, xpdmgw1' WHERE ""Hostname"" = 'AIASNLAS0043';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSwym 1,3DSwym, 3DComment 1, 3DNotification 1 ,CloudView' WHERE ""Hostname"" = 'AIASNLAS0044';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DDashboard 1, 3DComment 1, 3DNotification 1' WHERE ""Hostname"" = 'AIASNLAS0045';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSwym2 3DSwym-Index, 3DComment 2, 3DNotification 2,CloudView' WHERE ""Hostname"" = 'AIASNLAS0046';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace CAS 2' WHERE ""Hostname"" = 'AIASNLAS0047';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace No CAS 2, DerivedObjectsQueueServer' WHERE ""Hostname"" = 'AIASNLAS0048';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Unknown' WHERE ""Hostname"" = 'AIASNLAS004801';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DDashboard 2, 3DComment 2, 3DNotification 2' WHERE ""Hostname"" = 'AIASNLAS0049';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DPassport 2' WHERE ""Hostname"" = 'AIASNLAS0050';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DPassport 1' WHERE ""Hostname"" = 'AIASNLAS0051';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DPassport 1, 3DDashboard 1,FedSearch 1, 3DWidget 1' WHERE ""Hostname"" = 'AIASNLAS0052';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DPassport 2, 3DDashboard 2, FedSearch 2,  3DWidget 2' WHERE ""Hostname"" = 'AIASNLAS0053';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Master indexing server' WHERE ""Hostname"" = 'AIASNLAS0054';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Slave indexing server' WHERE ""Hostname"" = 'AIASNLAS0055';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Remote FCS Wuxi, File Converter' WHERE ""Hostname"" = 'AIASNLAS0056';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Remote FCS Houston, File Converter' WHERE ""Hostname"" = 'AIASNLAS0057';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Adapter' WHERE ""Hostname"" = 'AIASNLAS0058';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'IAT BoM in PLM - BoM Import' WHERE ""Hostname"" = 'AIASNLAS0059';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Client' WHERE ""Hostname"" = 'AIASNLAS0060';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Job Server' WHERE ""Hostname"" = 'AIASNLAS0061';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod' WHERE ""Hostname"" = 'AIASNLAS0062';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod' WHERE ""Hostname"" = 'AIASNLAS0063';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod' WHERE ""Hostname"" = 'AIASNLAS0064';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Adapter 1' WHERE ""Hostname"" = 'AIASNLAS0065';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Adapter 2' WHERE ""Hostname"" = 'AIASNLAS0066';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Jobserver 1' WHERE ""Hostname"" = 'AIASNLAS0067';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Jobserver 2' WHERE ""Hostname"" = 'AIASNLAS0068';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Client 1' WHERE ""Hostname"" = 'AIASNLAS0069';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Client 2' WHERE ""Hostname"" = 'AIASNLAS0070';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Apache LB 1 Main' WHERE ""Hostname"" = 'AIASNLAS0071';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod (VM is deleted Finops)' WHERE ""Hostname"" = 'AIASNLAS0072';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod (VM is deleted Finops)' WHERE ""Hostname"" = 'AIASNLAS0073';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Apache LB 2 Failover' WHERE ""Hostname"" = 'AIASNLAS0074';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod (VM is deleted Finops)' WHERE ""Hostname"" = 'AIASNLAS0075';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod (VM is deleted Finops)' WHERE ""Hostname"" = 'AIASNLAS0076';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod' WHERE ""Hostname"" = 'AIASNLAS0077';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod (VM is deleted Finops)' WHERE ""Hostname"" = 'AIASNLAS0078';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod (VM is deleted Finops)' WHERE ""Hostname"" = 'AIASNLAS0079';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod (VM is deleted Finops)' WHERE ""Hostname"" = 'AIASNLAS0080';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod (VM is deleted Finops)' WHERE ""Hostname"" = 'AIASNLAS0081';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod' WHERE ""Hostname"" = 'AIASNLAS0082';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod' WHERE ""Hostname"" = 'AIASNLAS0083';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod' WHERE ""Hostname"" = 'AIASNLAS0084';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Clients' WHERE ""Hostname"" = 'AIASNLAS0085';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'FedSearch 1, 3Dindexing' WHERE ""Hostname"" = 'AIASNLAS0088';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'FedSearch 2' WHERE ""Hostname"" = 'AIASNLAS0089';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace CAS 1' WHERE ""Hostname"" = 'AIASNLAS0090';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace CAS 2' WHERE ""Hostname"" = 'AIASNLAS0091';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace CAS 3' WHERE ""Hostname"" = 'AIASNLAS0092';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace CAS 4' WHERE ""Hostname"" = 'AIASNLAS0093';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace CAS 5' WHERE ""Hostname"" = 'AIASNLAS0094';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace CAS 6' WHERE ""Hostname"" = 'AIASNLAS0095';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace CAS 7' WHERE ""Hostname"" = 'AIASNLAS0096';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace No CAS 1, 3dxgw1, xpdmgw1' WHERE ""Hostname"" = 'AIASNLAS0097';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace No CAS 2, 3dxgw2, xpdmgw2' WHERE ""Hostname"" = 'AIASNLAS0098';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace NoCAS 3' WHERE ""Hostname"" = 'AIASNLAS0099';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSwym 1' WHERE ""Hostname"" = 'AIASNLAS0100';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSwym 2' WHERE ""Hostname"" = 'AIASNLAS0101';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DDashboard 1, 3DComment 1, 3DNotification 1' WHERE ""Hostname"" = 'AIASNLAS0102';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DDashboard 2, 3DComment 2, 3DNotification 2' WHERE ""Hostname"" = 'AIASNLAS0103';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Central FCS 1' WHERE ""Hostname"" = 'AIASNLAS0104';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Central FCS 2' WHERE ""Hostname"" = 'AIASNLAS0105';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Remote FCS Wuxi' WHERE ""Hostname"" = 'AIASNLAS0106';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DPassport 1' WHERE ""Hostname"" = 'AIASNLAS0107';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DPassport 2' WHERE ""Hostname"" = 'AIASNLAS0108';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Remote FCS Houston' WHERE ""Hostname"" = 'AIASNLAS0109';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Apache LB 1 Main' WHERE ""Hostname"" = 'AIASNLAS0110';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Apache LB 2 Failover' WHERE ""Hostname"" = 'AIASNLAS0111';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Jobserver 1 - Inventor, autocad, Office document, Jobserver LB' WHERE ""Hostname"" = 'AIASNLAS0112';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Jobserver 2 - Inventor, autocad, Office document' WHERE ""Hostname"" = 'AIASNLAS0113';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Jobserver 3 - Inventor, autocad, Office document' WHERE ""Hostname"" = 'AIASNLAS0114';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Jobserver 4 - Electrical Document, Step File Jobserver - Inventor, Derived Format Converter' WHERE ""Hostname"" = 'AIASNLAS0115';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Jobserver 5 - Debug Server, Step File Jobserver - CATIA V6' WHERE ""Hostname"" = 'AIASNLAS0116';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Adaptor 1' WHERE ""Hostname"" = 'AIASNLAS0117';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Adaptor 2' WHERE ""Hostname"" = 'AIASNLAS0118';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPGclient 1, Import from Spreadsheet,
Orchestrator
 Assembly Thumbnail Generator' WHERE ""Hostname"" = 'AIASNLAS0119';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPG client 2' WHERE ""Hostname"" = 'AIASNLAS0120';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Master index server' WHERE ""Hostname"" = 'AIASNLAS0121';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Slave index server' WHERE ""Hostname"" = 'AIASNLAS0122';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod - MIG_CAD_IMPORT_1' WHERE ""Hostname"" = 'AIASNLAS0123';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod - MIG_CAD_IMPORT_2' WHERE ""Hostname"" = 'AIASNLAS0124';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'IAT BoM in PLM - BoM Import; 3DPlay Geometry correction' WHERE ""Hostname"" = 'AIASNLAS0125';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod MIG_CAD_EXPORT_1' WHERE ""Hostname"" = 'AIASNLAS0126';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod MIG_CAD_EXPORT_2' WHERE ""Hostname"" = 'AIASNLAS0127';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod MIG_CAD_EXPORT_3' WHERE ""Hostname"" = 'AIASNLAS0128';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod - MIG_Metadata_impexp_1' WHERE ""Hostname"" = 'AIASNLAS0129';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'IAT BoM in PLM - BoM Import' WHERE ""Hostname"" = 'AIASNLAS0130';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod - MIG_Metadata_impexp_3' WHERE ""Hostname"" = 'AIASNLAS0131';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod - MIG_jms1' WHERE ""Hostname"" = 'AIASNLAS0132';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Migration_prod - MIG_orchestrator_server' WHERE ""Hostname"" = 'AIASNLAS0133';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Unknown - stopped' WHERE ""Hostname"" = 'AIASNLAS0134';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'FTS Crawler' WHERE ""Hostname"" = 'AIASNLAS0135';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DX All-In-One Server' WHERE ""Hostname"" = 'AIASNLAS0136';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DX All-In-One Server' WHERE ""Hostname"" = 'AIASNLAS0137';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'IAT BoM in PLM - BoM Import' WHERE ""Hostname"" = 'AIASNLAS0138';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace CAS 8' WHERE ""Hostname"" = 'AIASNLAS0139';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace CAS 9' WHERE ""Hostname"" = 'AIASNLAS0140';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace CAS 8' WHERE ""Hostname"" = 'AIASNLAS0141';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DSpace CAS 9' WHERE ""Hostname"" = 'AIASNLAS0142';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Non-Production Database' WHERE ""Hostname"" = 'AIASNLDB0001';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'QA Oracle Database server' WHERE ""Hostname"" = 'AIASNLDB0002';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Database' WHERE ""Hostname"" = 'AIASNLDB0005';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Database' WHERE ""Hostname"" = 'AIASNLDB0006';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Database' WHERE ""Hostname"" = 'AIASNLDB0007';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Database' WHERE ""Hostname"" = 'AIASNLDB0008';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Remote FCS Gecia' WHERE ""Hostname"" = 'SSISINENO036';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = '3DX All-In-One Server' WHERE ""Hostname"" = 'vmd10008847e24x';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Storage account - fcsdatawuxiqa' WHERE ""Hostname"" = 'fcsstoragehouston';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Storage accounts - fcsdatahoustonprod' WHERE ""Hostname"" = 'fcsstoragehoustonprod';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Storage accounts -fcsdatawuxiqa' WHERE ""Hostname"" = 'fcsstoragewuxi';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Storage accounts - fcsdatawuxiprod' WHERE ""Hostname"" = 'fcsstoragewuxiprod';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Storage accounts - prodfcscentral and prodjobserver' WHERE ""Hostname"" = 'prodfcscentral';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Storage accounts - oraclebackupnonprod' WHERE ""Hostname"" = '2021xnonproddbbackups';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Storage accounts - oraclebackupprod' WHERE ""Hostname"" = '2021xproddbbackups';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Storage accounts - xpdmgw, mediautils and custo-dev-jobserver-fileshare 
Decommissioned: ac-rgp-d-app-10007216-vmstartupa116' WHERE ""Hostname"" = 'acstadapp10007216a';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Storage accounts - iat-migration,plm-external-disk-in-cloud,qafcsshare and test-fcs-share
Decommissioned: edatmigration and test-fcs-share' WHERE ""Hostname"" = 'acstadapp10007216b';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'DSLS License Server Node 1 , License Statistics (X-Formation)' WHERE ""Hostname"" = 'SSCSBEAP4103';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'DSLS License Server Node 2' WHERE ""Hostname"" = 'SSCSBEAP4104';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'DSLS License Server Node 3' WHERE ""Hostname"" = 'SSCSBEAP4105';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Job Server' WHERE ""Hostname"" = 'vmd10008847e001';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Clients' WHERE ""Hostname"" = 'vmd10008847e002';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Client, Orchestrator' WHERE ""Hostname"" = 'vmd10008847e003';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Job Server' WHERE ""Hostname"" = 'vmd10008847e004';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Job Server' WHERE ""Hostname"" = 'vmt10008847e001';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Orchestrator' WHERE ""Hostname"" = 'vmt10008847e002';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Job Server' WHERE ""Hostname"" = 'vmt10008847et02';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Jobserver 1' WHERE ""Hostname"" = 'vms10008847e001';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Jobserver 2,  Derived Format Converter' WHERE ""Hostname"" = 'vms10008847e002';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPDM Client 2' WHERE ""Hostname"" = 'vms10008847e004';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Jobserver 1 - Inventor, autocad, Office document, Jobserver LB' WHERE ""Hostname"" = 'vmp10008847ej01';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Jobserver 2 - Inventor, autocad, Office document' WHERE ""Hostname"" = 'vmp10008847ej02';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Jobserver 3 - Inventor, autocad, Office document' WHERE ""Hostname"" = 'vmp10008847ej03';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Jobserver 4 - Electrical Document, Step File Jobserver - Inventor, Derived Format Converter' WHERE ""Hostname"" = 'vmp10008847ej04';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Jobserver 5 - Debug Server, Step File Jobserver - CATIA V6' WHERE ""Hostname"" = 'vmp10008847ej05';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPGclient 1, Import from Spreadsheet, Orchestrator' WHERE ""Hostname"" = 'vmp10008847ex01';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'XPG client 2' WHERE ""Hostname"" = 'vmp10008847ex02';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'IAT BoM in PLM - BoM Import' WHERE ""Hostname"" = 'vmp10008847em01';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'IAT BoM in PLM - BoM Import;
 3DPlay Geometry correction' WHERE ""Hostname"" = 'vmp10008847em02';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'IAT BoM in PLM - BoM Import' WHERE ""Hostname"" = 'vmp10008847em03';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'IAT BoM in PLM - BoM Import' WHERE ""Hostname"" = 'vmp10008847em04';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Remote FCS Gecia' WHERE ""Hostname"" = 'vmp10008847afcs';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Remote FCS Gecia, File Converter' WHERE ""Hostname"" = 'vmd10008847afcs';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Key Vault' WHERE ""Hostname"" = 'Atlas2021x3632';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Key Vault' WHERE ""Hostname"" = 'Atlas2021x3634';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Key Vault' WHERE ""Hostname"" = 'kv-d-10007216-001-r2021x';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Key Vault' WHERE ""Hostname"" = 'kv-d-10007216-002-r2021x';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Key Vault' WHERE ""Hostname"" = 'kv-p-10007216-002-r2021x';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Key Vault' WHERE ""Hostname"" = 'kv-q-10007216-001-r2021x';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Key Vault' WHERE ""Hostname"" = 'kv-t-10007216-001-r2021x';
UPDATE ""IG_ResourcesTBL"" SET ""Function"" = 'Remote FCS Gecia' WHERE ""Hostname"" = 'SSISINFCSQA108';
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
