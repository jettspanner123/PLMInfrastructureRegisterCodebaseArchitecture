import {
  Database,
  Globe,
  Bot,
  Sliders,
  ArrowDown,
  Minus,
  ArrowUp,
  Flame,
  Clock,
  Calendar,
  Play,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { FeatureRequestCategoryEnumModel } from '../../../Models/FeatureRequestCategoryEnumModel';
import { FeatureRequestPriorityEnumModel } from '../../../Models/FeatureRequestPriorityEnumModel';
import { FeatureRequestStatusEnumModel } from '../../../Models/FeatureRequestStatusEnumModel';
import type { SelectOption } from '../../../Shared/Components/CustomSelectSharedComponent';

export default class FeatureRequestsCON {
  public static readonly SCREEN_TITLE: string = 'Feature Requests';
  public static readonly SCREEN_SUBTITLE: string = 'Submit ideas, track enhancement requests, and monitor implementation progress';

  public static readonly FORM_HEADER_TITLE: string = 'Submit a Feature Request';
  public static readonly FORM_HEADER_DESCRIPTION: string = 'Have a suggestion or need a new capability? Let us know what you need.';

  public static readonly FIELD_TITLE_LABEL: string = 'Feature Title';
  public static readonly FIELD_TITLE_PLACEHOLDER: string = 'e.g. Export table data to Excel spreadsheet';

  public static readonly FIELD_CATEGORY_LABEL: string = 'Target Module / Area';
  public static readonly FIELD_PRIORITY_LABEL: string = 'Urgency / Priority';

  // Sourced from the same shared, growable Sponsor options list Environment
  // Overview's own Sponsor dropdown uses (ConfigurationConstants fieldName
  // "Sponsor") - not a separate options list of its own.
  public static readonly FIELD_REQUESTER_LABEL: string = 'Requester Name';
  public static readonly FIELD_REQUESTER_PLACEHOLDER: string = 'Search or select a requester...';

  public static readonly FIELD_DESCRIPTION_LABEL: string = 'Detailed Description & Use Case';
  public static readonly FIELD_DESCRIPTION_PLACEHOLDER: string =
    'Describe what you want to achieve, why it is needed, and any specific requirements or expected behavior...';

  public static readonly BUTTON_SUBMIT_LABEL: string = 'Submit Request';
  public static readonly BUTTON_RESET_LABEL: string = 'Clear Form';

  public static readonly LIST_HEADER_TITLE: string = 'Submitted Requests';
  public static readonly SEARCH_PLACEHOLDER: string = 'Search requests by title, description, or author...';

  public static readonly FILTER_ALL_CATEGORIES: string = 'ALL_CATEGORIES';
  public static readonly FILTER_ALL_STATUSES: string = 'ALL_STATUSES';

  public static readonly CATEGORY_OPTIONS: SelectOption[] = [
    {
      value: FeatureRequestCategoryEnumModel.InfrastructureRegister,
      label: 'Infrastructure Register',
      sublabel: 'Core resource grid & Azure sync',
      icon: <Database className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />,
    },
    {
      value: FeatureRequestCategoryEnumModel.EnvironmentOverview,
      label: 'Environment Overview',
      sublabel: 'Environment statuses & uptime schedules',
      icon: <Globe className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />,
    },
    {
      value: FeatureRequestCategoryEnumModel.ChatAssistant,
      label: 'Chat Assistant',
      sublabel: 'AI copilot & register intelligence',
      icon: <Bot className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400 shrink-0" />,
    },
    {
      value: FeatureRequestCategoryEnumModel.General,
      label: 'General / UI / Settings',
      sublabel: 'Theme, layouts, controls, subscriptions',
      icon: <Sliders className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />,
    },
  ];

  public static readonly PRIORITY_OPTIONS: SelectOption[] = [
    {
      value: FeatureRequestPriorityEnumModel.Low,
      label: 'Low',
      sublabel: 'Nice to have, minor quality of life improvement',
      icon: <ArrowDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />,
    },
    {
      value: FeatureRequestPriorityEnumModel.Medium,
      label: 'Medium',
      sublabel: 'Helpful enhancement for regular workflow',
      icon: <Minus className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />,
    },
    {
      value: FeatureRequestPriorityEnumModel.High,
      label: 'High',
      sublabel: 'Important capability needed for active tasks',
      icon: <ArrowUp className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400 shrink-0" />,
    },
    {
      value: FeatureRequestPriorityEnumModel.Critical,
      label: 'Critical',
      sublabel: 'Urgent requirement affecting key deliverables',
      icon: <Flame className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />,
    },
  ];

  public static readonly STATUS_OPTIONS: SelectOption[] = [
    {
      value: FeatureRequestStatusEnumModel.UnderReview,
      label: 'Under Review',
      sublabel: 'Received and awaiting evaluation',
      icon: <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />,
    },
    {
      value: FeatureRequestStatusEnumModel.Planned,
      label: 'Planned',
      sublabel: 'Approved and scheduled for implementation',
      icon: <Calendar className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />,
    },
    {
      value: FeatureRequestStatusEnumModel.InProgress,
      label: 'In Progress',
      sublabel: 'Actively being designed or built',
      icon: <Play className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />,
    },
    {
      value: FeatureRequestStatusEnumModel.Completed,
      label: 'Completed',
      sublabel: 'Implemented and live in InfraGrid',
      icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />,
    },
    {
      value: FeatureRequestStatusEnumModel.Declined,
      label: 'Declined',
      sublabel: 'Not currently feasible or out of scope',
      icon: <XCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />,
    },
  ];

  public static readonly DELETE_MODAL_TITLE: string = 'Delete Feature Request';
  public static readonly DELETE_MODAL_DESCRIPTION: string =
    'Are you sure you want to delete this feature request? This action will remove it from the active requests feed.';
}
