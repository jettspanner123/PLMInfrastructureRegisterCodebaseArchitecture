using System;
using System.Globalization;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.DowntimeAnnouncements.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.DowntimeAnnouncements.Assertion
{
    public sealed class DowntimeAnnouncementsAssertion
    {
        private static readonly DowntimeAnnouncementsAssertion _current = new DowntimeAnnouncementsAssertion();

        public static DowntimeAnnouncementsAssertion Current => _current;

        private DowntimeAnnouncementsAssertion()
        {
        }

        public void AssertCreateRequest(CreateDowntimeAnnouncementDTO? request)
        {
            if (request is null)
            {
                throw new ValidationException("Downtime announcement payload cannot be null.");
            }

            if (string.IsNullOrWhiteSpace(request.Heading))
            {
                throw new ValidationException("Heading is required.");
            }

            if (request.Heading.Trim().Length > 200)
            {
                throw new ValidationException("Heading cannot exceed 200 characters.");
            }

            if (string.IsNullOrWhiteSpace(request.Description))
            {
                throw new ValidationException("Description is required.");
            }

            if (request.Description.Trim().Length > 4000)
            {
                throw new ValidationException("Description cannot exceed 4000 characters.");
            }

            if (!DateTime.TryParse(
                    request.StartAt,
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out DateTime parsedStartAt))
            {
                throw new ValidationException("'Start' date/time is invalid.");
            }

            if (!DateTime.TryParse(
                    request.EndAt,
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out DateTime parsedEndAt))
            {
                throw new ValidationException("'End' date/time is invalid.");
            }

            if (parsedEndAt <= parsedStartAt)
            {
                throw new ValidationException("'End' must be strictly after 'Start'.");
            }

            if (request.Environments is null || request.Environments.Count == 0)
            {
                throw new ValidationException("At least one affected environment is required.");
            }
        }

        // Same validation rules as AssertCreateRequest - UpdateDowntimeAnnouncementDTO
        // has the identical shape, but is a different type, so the checks
        // can't be shared via a single overload without introducing a common
        // base type nothing else needs.
        public void AssertUpdateRequest(UpdateDowntimeAnnouncementDTO? request)
        {
            if (request is null)
            {
                throw new ValidationException("Downtime announcement payload cannot be null.");
            }

            if (string.IsNullOrWhiteSpace(request.Heading))
            {
                throw new ValidationException("Heading is required.");
            }

            if (request.Heading.Trim().Length > 200)
            {
                throw new ValidationException("Heading cannot exceed 200 characters.");
            }

            if (string.IsNullOrWhiteSpace(request.Description))
            {
                throw new ValidationException("Description is required.");
            }

            if (request.Description.Trim().Length > 4000)
            {
                throw new ValidationException("Description cannot exceed 4000 characters.");
            }

            if (!DateTime.TryParse(
                    request.StartAt,
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out DateTime parsedStartAt))
            {
                throw new ValidationException("'Start' date/time is invalid.");
            }

            if (!DateTime.TryParse(
                    request.EndAt,
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out DateTime parsedEndAt))
            {
                throw new ValidationException("'End' date/time is invalid.");
            }

            if (parsedEndAt <= parsedStartAt)
            {
                throw new ValidationException("'End' must be strictly after 'Start'.");
            }

            if (request.Environments is null || request.Environments.Count == 0)
            {
                throw new ValidationException("At least one affected environment is required.");
            }
        }

        // Both required (unlike EnvironmentUptimeRequestsAssertion.AssertOptionalDateRangeQuery -
        // this endpoint's range is always required, never optional).
        public void AssertDateRangeQuery(DateTime fromAt, DateTime toAt)
        {
            if (toAt < fromAt)
            {
                throw new ValidationException("'toAt' must not be before 'fromAt'.");
            }
        }

        public void AssertValidId(Guid id)
        {
            if (id == Guid.Empty)
            {
                throw new ValidationException("A valid non-empty Downtime Announcement ID is required.");
            }
        }
    }
}
