namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions
{
    public sealed class ValidationException : Exception
    {
        public List<string> ValidationErrors { get; }

        public ValidationException(string message)
            : base(message)
        {
            ValidationErrors = new List<string> { message };
        }

        public ValidationException(List<string> validationErrors)
            : base(validationErrors.Count > 0 ? validationErrors[0] : "Validation failed.")
        {
            ValidationErrors = validationErrors;
        }
    }
}
