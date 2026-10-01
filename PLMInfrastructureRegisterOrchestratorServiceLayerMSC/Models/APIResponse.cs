namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models
{
    public sealed class APIResponse<T>
    {
        public bool Status { get; set; }

        public string Message { get; set; } = string.Empty;

        public T? Data { get; set; }

        public List<string> Errors { get; set; } = new List<string>();

        public static APIResponse<T> Succeeded(T data, string message, int statusCode)
        {
            return new APIResponse<T>
            {
                Status = true,
                Message = message,
                Data = data,
            };
        }

        public static APIResponse<T> Failed(string message, List<string> errors, int statusCode)
        {
            return new APIResponse<T>
            {
                Status = false,
                Message = message,
                Errors = errors,
            };
        }
    }
}
