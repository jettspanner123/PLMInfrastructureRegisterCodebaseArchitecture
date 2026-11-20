import React, { useMemo, useState } from 'react';
import {
  Search,
  CalendarX2,
  Layers,
  Clock,
  CheckCircle2,
  CheckCircle,
  XCircle,
  Ban,
} from 'lucide-react';
import InputSharedComponent from '../../../Shared/Components/InputSharedComponent';
import CustomSelectSharedComponent, { type SelectOption } from '../../../Shared/Components/CustomSelectSharedComponent';
import BadgeSharedComponent from '../../../Shared/Components/BadgeSharedComponent';
import EmptyStateSharedComponent from '../../../Shared/Components/EmptyStateSharedComponent';
import EnvironmentUptimeRequestCardStaticComponent from './EnvironmentUptimeRequestCardStaticComponent';
import EnvironmentUptimeRequestsCON from '../Constants/EnvironmentUptimeRequestsCON';
import { EnvironmentUptimeRequestStatusEnumModel } from '../../../Models/EnvironmentUptimeRequestStatusEnumModel';
import type EnvironmentUptimeRequestInterfaceModel from '../../../Models/EnvironmentUptimeRequestInterfaceModel';

export interface EnvironmentUptimeRequestListFeedStaticComponentProps {
  requests: EnvironmentUptimeRequestInterfaceModel[];
  isLoading?: boolean;
  onDeleteRequest: (id: string) => void;
  // 'stacked' (default): one self-contained block, as used in Form view.
  // 'split': the control card and the list body render as two separate
  // grid children instead of one wrapped block, so a parent grid (the
  // Dashboard view) can place them in different rows - the control card
  // shares a grid row with the Dashboard's summary cards so both end up
  // the same height (CSS Grid's default row-stretch).
  layout?: 'stacked' | 'split';
}

function getStatusOptionIcon(statusValue: string): React.ReactNode {
  switch (statusValue) {
    case EnvironmentUptimeRequestStatusEnumModel.Pending:
      return <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    case EnvironmentUptimeRequestStatusEnumModel.Approved:
      return <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />;
    case EnvironmentUptimeRequestStatusEnumModel.Completed:
      return <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    case EnvironmentUptimeRequestStatusEnumModel.Rejected:
      return <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
    case EnvironmentUptimeRequestStatusEnumModel.Cancelled:
      return <Ban className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />;
    default:
      return <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />;
  }
}

export default function EnvironmentUptimeRequestListFeedStaticComponent({
  requests,
  isLoading = false,
  onDeleteRequest,
  layout = 'stacked',
}: EnvironmentUptimeRequestListFeedStaticComponentProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>(EnvironmentUptimeRequestsCON.FILTER_ALL_STATUSES);

  const statusFilterOptions: SelectOption[] = useMemo(
    () => [
      {
        value: EnvironmentUptimeRequestsCON.FILTER_ALL_STATUSES,
        label: 'All Statuses',
        icon: <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />,
      },
      ...EnvironmentUptimeRequestsCON.STATUS_OPTIONS.map((opt) => ({
        ...opt,
        icon: getStatusOptionIcon(opt.value),
      })),
    ],
    []
  );

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchesTicketId = req.ticketId.toLowerCase().includes(query);
        const matchesEnvironment = req.environment.toLowerCase().includes(query);
        const matchesRequester = req.requesterName.toLowerCase().includes(query);
        const matchesMessage = (req.message ?? '').toLowerCase().includes(query);
        if (!matchesTicketId && !matchesEnvironment && !matchesRequester && !matchesMessage) {
          return false;
        }
      }

      if (selectedStatus !== EnvironmentUptimeRequestsCON.FILTER_ALL_STATUSES && req.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [requests, searchQuery, selectedStatus]);

  // h-full only in 'split' mode, where this block is a direct CSS Grid
  // child that needs to fill its row-stretched cell (matching the
  // Dashboard's summary cards). In 'stacked' mode (Form view) the parent
  // is a plain flex column with no bounding height, so h-full there would
  // just inflate this card with blank space instead of sizing to content.
  const controlsBlock = (
    <div className={`bg-white dark:bg-[#171717] p-4 rounded-xl border border-slate-300/70 dark:border-zinc-800/80 shadow-xs flex flex-col gap-3${layout === 'split' ? ' h-full' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
            {EnvironmentUptimeRequestsCON.LIST_HEADER_TITLE}
          </h2>
          <BadgeSharedComponent variant="neutral" size="sm">
            {filteredRequests.length} of {requests.length}
          </BadgeSharedComponent>
        </div>
      </div>

      {/* Search Input */}
      <InputSharedComponent
        placeholder={EnvironmentUptimeRequestsCON.SEARCH_PLACEHOLDER}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        icon={<Search className="w-4 h-4" />}
        surface="onCard"
      />

      {/* Status Filter */}
      <CustomSelectSharedComponent
        value={selectedStatus}
        options={statusFilterOptions}
        onChange={(val) => setSelectedStatus(val)}
        size="sm"
        surface="onCard"
      />
    </div>
  );

  const listBodyBlock = (
    // h-full only in 'split' mode (same reasoning as controlsBlock above) -
    // in 'stacked' mode this reverts to flex-1, which correctly grows
    // within the Form view's own flex-col wrapper instead of forcing an
    // unbounded h-full in a context with nothing to bound it against.
    <div className={`overflow-y-auto pr-1 flex flex-col gap-3.5 ${layout === 'split' ? 'h-full' : 'flex-1'}`}>
      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-sm text-slate-400">
          Loading uptime requests...
        </div>
      ) : filteredRequests.length === 0 ? (
        <EmptyStateSharedComponent
          title={requests.length === 0 ? 'No Uptime Requests Yet' : 'No Matching Requests'}
          description={
            requests.length === 0
              ? layout === 'split'
                ? 'Submit your first planned uptime or downtime window using the form on the Form view.'
                : 'Submit your first planned uptime or downtime window using the form on the left.'
              : 'Try adjusting your search query or filter to find what you are looking for.'
          }
          icon={<CalendarX2 className="w-8 h-8 text-slate-400" />}
          className="flex-1"
        />
      ) : (
        filteredRequests.map((req) => (
          <EnvironmentUptimeRequestCardStaticComponent
            key={req.id}
            request={req}
            onDelete={() => onDeleteRequest(req.id)}
          />
        ))
      )}
    </div>
  );

  if (layout === 'split') {
    return (
      <React.Fragment>
        <div className="lg:col-start-2 lg:row-start-1">{controlsBlock}</div>
        <div className="lg:col-start-2 lg:row-start-2">{listBodyBlock}</div>
      </React.Fragment>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3">
      {controlsBlock}
      {listBodyBlock}
    </div>
  );
}
