using System;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.FeatureRequests.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.FeatureRequests.Assertion
{
    public sealed class FeatureRequestsAssertion
    {
        private static readonly FeatureRequestsAssertion _current = new FeatureRequestsAssertion();

        public static FeatureRequestsAssertion Current => _current;

        private FeatureRequestsAssertion()
        {
        }

        public void AssertCreateRequest(CreateFeatureRequestDTO? request)
        {
            if (request is null)
            {
                throw new ValidationException("Feature request payload cannot be null.");
            }

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                throw new ValidationException("Title is required.");
            }

            if (request.Title.Trim().Length < 3 || request.Title.Trim().Length > 250)
            {
                throw new ValidationException("Title must be between 3 and 250 characters.");
            }

            if (string.IsNullOrWhiteSpace(request.Description))
            {
                throw new ValidationException("Description is required.");
            }

            if (request.Description.Trim().Length < 5)
            {
                throw new ValidationException("Description must be at least 5 characters long.");
            }

            if (string.IsNullOrWhiteSpace(request.RequesterName))
            {
                throw new ValidationException("Requester name is required.");
            }

            if (request.RequesterName.Trim().Length > 150)
            {
                throw new ValidationException("Requester name cannot exceed 150 characters.");
            }

            if (!Enum.IsDefined(typeof(FeatureRequestCategoryEnum), request.Category))
            {
                throw new ValidationException("Invalid feature request category specified.");
            }

            if (!Enum.IsDefined(typeof(FeatureRequestPriorityEnum), request.Priority))
            {
                throw new ValidationException("Invalid feature request priority specified.");
            }
        }

        public void AssertUpdateStatusRequest(UpdateFeatureRequestStatusDTO? request)
        {
            if (request is null)
            {
                throw new ValidationException("Update status payload cannot be null.");
            }

            if (!Enum.IsDefined(typeof(FeatureRequestStatusEnum), request.Status))
            {
                throw new ValidationException("Invalid feature request status specified.");
            }
        }

        public void AssertValidId(Guid id)
        {
            if (id == Guid.Empty)
            {
                throw new ValidationException("A valid non-empty Feature Request ID is required.");
            }
        }
    }
}
