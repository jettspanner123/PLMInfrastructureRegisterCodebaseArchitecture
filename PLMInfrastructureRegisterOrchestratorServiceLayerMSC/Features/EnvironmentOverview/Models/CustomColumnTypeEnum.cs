namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    // Fixed, closed set (unlike Status/Sponsor, which are user-growable via
    // ConfigurationConstants) - a column's type is picked once from exactly
    // these four options and never changes afterward.
    public enum CustomColumnTypeEnum
    {
        Text,
        Number,
        Date,
        Dropdown,
    }
}
