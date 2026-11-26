using System;
using System.Globalization;
using System.Text.RegularExpressions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.CalendarActivities.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.CalendarActivities.Assertion
{
    public sealed class CalendarActivitiesAssertion
    {
        private static readonly CalendarActivitiesAssertion _current = new CalendarActivitiesAssertion();

        public static CalendarActivitiesAssertion Current => _current;

        // Same plausible-shape-only regex as EnvironmentUptimeRequestsAssertion's
        // RequesterEmail check (data-model.md).
        private static readonly Regex _plausibleEmailRegex = new Regex(
            @"^[^\s@]+@[^\s@]+\.[^\s@]+$",
            RegexOptions.Compiled);

        private CalendarActivitiesAssertion()
        {
        }

        public void AssertCreateRequest(CreateCalendarActivityDTO? request)
        {
            if (request is null)
            {
                throw new ValidationException("Calendar activity payload cannot be null.");
            }

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                throw new ValidationException("Title is required.");
            }

            if (request.Title.Trim().Length > 200)
            {
                throw new ValidationException("Title cannot exceed 200 characters.");
            }

            if (string.IsNullOrWhiteSpace(request.Description))
            {
                throw new ValidationException("Description is required.");
            }

            if (request.Description.Trim().Length > 4000)
            {
                throw new ValidationException("Description cannot exceed 4000 characters.");
            }

            if (string.IsNullOrWhiteSpace(request.Environment))
            {
                throw new ValidationException("Environment is required.");
            }

            if (string.IsNullOrWhiteSpace(request.ResponsiblePerson))
            {
                throw new ValidationException("Responsible person is required.");
            }

            if (string.IsNullOrWhiteSpace(request.ContactEmail) || !_plausibleEmailRegex.IsMatch(request.ContactEmail.Trim()))
            {
                throw new ValidationException("Contact email is not a valid email address.");
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
        }
    }
}
