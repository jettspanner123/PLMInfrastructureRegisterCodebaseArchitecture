using System;
using System.Globalization;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentUptimeRequests.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentUptimeRequests.Assertion
{
    public sealed class EnvironmentUptimeRequestsAssertion
    {
        private static readonly EnvironmentUptimeRequestsAssertion _current = new EnvironmentUptimeRequestsAssertion();

        public static EnvironmentUptimeRequestsAssertion Current => _current;

        private EnvironmentUptimeRequestsAssertion()
        {
        }

        public void AssertCreateRequest(CreateEnvironmentUptimeRequestDTO? request)
        {
            if (request is null)
            {
                throw new ValidationException("Uptime request payload cannot be null.");
            }

            if (string.IsNullOrWhiteSpace(request.Environment))
            {
                throw new ValidationException("Environment is required.");
            }

            if (string.IsNullOrWhiteSpace(request.RequesterName))
            {
                throw new ValidationException("Requester name is required.");
            }

            if (!DateTime.TryParse(
                    request.FromAt,
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out DateTime parsedFromAt))
            {
                throw new ValidationException("'From' date/time is invalid.");
            }

            if (!DateTime.TryParse(
                    request.ToAt,
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out DateTime parsedToAt))
            {
                throw new ValidationException("'To' date/time is invalid.");
            }

            if (parsedToAt <= parsedFromAt)
            {
                throw new ValidationException("'To' must be strictly after 'From'.");
            }

            if (request.Message is not null && request.Message.Trim().Length > 4000)
            {
                throw new ValidationException("Message cannot exceed 4000 characters.");
            }
        }

        public void AssertValidId(Guid id)
        {
            if (id == Guid.Empty)
            {
                throw new ValidationException("A valid non-empty Uptime Request ID is required.");
            }
        }

        public void AssertUpdateStatusRequest(UpdateEnvironmentUptimeRequestStatusDTO? request)
        {
            if (request is null)
            {
                throw new ValidationException("Status update payload cannot be null.");
            }

            if (!Enum.IsDefined(typeof(EnvironmentUptimeRequestStatusEnum), request.Status))
            {
                throw new ValidationException("Status is not a recognized value.");
            }

            if (request.AdminMessage is not null && request.AdminMessage.Trim().Length > 4000)
            {
                throw new ValidationException("Admin message cannot exceed 4000 characters.");
            }
        }
    }
}
