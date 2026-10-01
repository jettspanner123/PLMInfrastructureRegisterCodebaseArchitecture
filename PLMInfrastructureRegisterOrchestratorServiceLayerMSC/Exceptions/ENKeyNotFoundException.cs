namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions
{
    public sealed class ENKeyNotFoundException : Exception
    {
        public string Key { get; }

        public ENKeyNotFoundException(string key)
            : base($"Environment key '{key}' was not found in the .env file or the process environment.")
        {
            Key = key;
        }
    }
}
