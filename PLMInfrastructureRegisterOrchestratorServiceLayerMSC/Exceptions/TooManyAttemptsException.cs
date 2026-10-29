namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions
{
    public sealed class TooManyAttemptsException : Exception
    {
        public TooManyAttemptsException(string message)
            : base(message)
        {
        }
    }
}
