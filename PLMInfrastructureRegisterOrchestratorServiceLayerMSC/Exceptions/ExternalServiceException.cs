namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions
{
    // An upstream/external dependency (e.g. Jira) failed or could not be
    // reached - mapped to HTTP 502 by the catching controller, distinct from
    // this app's own validation/conflict/not-found failures.
    public sealed class ExternalServiceException : Exception
    {
        public ExternalServiceException(string message)
            : base(message)
        {
        }
    }
}
