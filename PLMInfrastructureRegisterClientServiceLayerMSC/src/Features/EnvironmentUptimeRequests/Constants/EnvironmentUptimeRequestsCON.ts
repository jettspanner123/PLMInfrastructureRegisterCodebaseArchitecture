import { EnvironmentUptimeRequestStatusEnumModel } from '../../../Models/EnvironmentUptimeRequestStatusEnumModel';
import type { SelectOption } from '../../../Shared/Components/CustomSelectSharedComponent';

export default class EnvironmentUptimeRequestsCON {
  public static readonly SCREEN_TITLE: string = 'Uptime Request';
  public static readonly SCREEN_SUBTITLE: string =
    'Request and track planned uptime/downtime windows for an environment.';

  public static readonly FORM_HEADER_TITLE: string = 'Submit an Uptime Request';
  public static readonly FORM_HEADER_DESCRIPTION: string =
    'Request a planned uptime or downtime window for one of your environments.';

  public static readonly FIELD_ENVIRONMENT_LABEL: string = 'Environment';
  public static readonly FIELD_ENVIRONMENT_PLACEHOLDER: string = 'Select an environment...';

  public static readonly FIELD_FROM_LABEL: string = 'From (CET)';
  public static readonly FIELD_TO_LABEL: string = 'To (CET)';

  public static readonly FIELD_MESSAGE_LABEL: string = 'Message (Optional)';
  public static readonly FIELD_MESSAGE_PLACEHOLDER: string =
    'Add any additional context for this uptime window...';
  // Soft DB/UI sanity cap, not a PRD requirement - the create payload's own
  // server-side validation (EnvironmentUptimeRequestsAssertion) enforces the
  // same limit.
  public static readonly FIELD_MESSAGE_MAX_LENGTH: number = 4000;

  public static readonly BUTTON_SUBMIT_LABEL: string = 'Submit Request';
  public static readonly BUTTON_RESET_LABEL: string = 'Clear Form';

  public static readonly LIST_HEADER_TITLE: string = 'Submitted Requests';
  public static readonly SEARCH_PLACEHOLDER: string = 'Search requests by environment or message...';

  public static readonly FILTER_ALL_STATUSES: string = 'ALL_STATUSES';

  public static readonly STATUS_OPTIONS: SelectOption[] = [
    { value: EnvironmentUptimeRequestStatusEnumModel.Pending, label: 'Pending' },
    { value: EnvironmentUptimeRequestStatusEnumModel.Approved, label: 'Approved' },
    { value: EnvironmentUptimeRequestStatusEnumModel.Completed, label: 'Completed' },
    { value: EnvironmentUptimeRequestStatusEnumModel.Rejected, label: 'Rejected' },
    { value: EnvironmentUptimeRequestStatusEnumModel.Cancelled, label: 'Cancelled' },
  ];

  public static readonly DELETE_MODAL_TITLE: string = 'Delete Uptime Request';
  public static readonly DELETE_MODAL_DESCRIPTION: string =
    'Are you sure you want to delete this uptime request? This action will remove it from the active requests feed.';

  public static readonly COPY_TOAST_TITLE: string = 'Ticket ID copied';

  public static readonly DETAIL_BACK_LINK_LABEL: string = 'Back to Uptime Requests';
  public static readonly DETAIL_NOT_FOUND_TITLE: string = 'Uptime Request Not Found';
  public static readonly DETAIL_NOT_FOUND_DESCRIPTION: string =
    'This ticket does not exist, or it has since been deleted.';
}
