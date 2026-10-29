using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Admin.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Admin.Assertion
{
    public sealed class AdminAssertion
    {
        private static readonly AdminAssertion _current = new AdminAssertion();

        public static AdminAssertion Current => _current;

        private AdminAssertion()
        {
        }

        public void AssertLoginRequest(AdminLoginRequestDTO? request)
        {
            if (request is null)
            {
                throw new ValidationException("Login payload cannot be null.");
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                throw new ValidationException("Email is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                throw new ValidationException("Password is required.");
            }
        }
    }
}
