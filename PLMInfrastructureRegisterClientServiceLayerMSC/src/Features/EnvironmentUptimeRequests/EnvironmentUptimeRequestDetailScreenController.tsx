import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  ArrowLeft,
  Globe,
  CalendarClock,
  Clock,
  FileText,
  SearchX,
  Search,
  Layers,
  CheckCircle2,
  CheckCircle,
  XCircle,
  Ban,
  User,
} from 'lucide-react';
import CardSharedComponent from '../../Shared/Components/CardSharedComponent';
import BadgeSharedComponent, { type BadgeSharedComponentProps } from '../../Shared/Components/BadgeSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import InputSharedComponent from '../../Shared/Components/InputSharedComponent';
import CustomSelectSharedComponent, { type SelectOption } from '../../Shared/Components/CustomSelectSharedComponent';
import ConfirmationModalSharedComponent from '../../Shared/Components/ConfirmationModalSharedComponent';
import ButtonSharedComponent from '../../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../../Shared/Components/PrimaryActionButtonSharedComponent';
import EnvironmentUptimeRequestCardStaticComponent from './Components/EnvironmentUptimeRequestCardStaticComponent';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import ApplicationRouteCON from '../../Constants/ApplicationRouteCON';
import CETDateTimeFormatUtility from '../../Utilities/CETDateTimeFormatUtility';
import EnvironmentUptimeRequestsCON from './Constants/EnvironmentUptimeRequestsCON';
import { useIsAdmin } from '../../Utilities/AdminIdentityUtility';
import { EnvironmentUptimeRequestStatusEnumModel } from '../../Models/EnvironmentUptimeRequestStatusEnumModel';

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

export default function EnvironmentUptimeRequestDetailScreenController(): React.JSX.Element {
  // Reads the ticketId straight off the URL path, the same way
  // NavigationController/RootLayout already derive the active route from
  // location.pathname - this app's installed @tanstack/react-router version
  // cannot fully type-check useParams({ from: ... }) against this route
  // tree (a library/compiler type-inference limitation, not specific to
  // this one route), so the plain, always-correctly-typed pathname split is
  // used here instead of the (currently unusable) typed params hook.
  const location = useLocation();
  const ticketId = location.pathname.split('/').filter(Boolean).pop() ?? '';

  const { data: requests = [], isLoading } =
    TanstackQueryClientService.current.environmentUptimeRequests.useEnvironmentUptimeRequestsQuery();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const deleteMutation = TanstackQueryClientService.current.environmentUptimeRequests.useDeleteEnvironmentUptimeRequestMutation({
    onSuccess: () => setDeleteTargetId(null),
  });

  // Admin-only status/message editor - the dropdown, message box, and
  // Cancel/Save are only ever rendered for an admin; a non-admin only ever
  // sees the resulting AdminMessage (if any), read-only.
  const isAdmin = useIsAdmin();
  const [statusDraft, setStatusDraft] = useState<string>(EnvironmentUptimeRequestStatusEnumModel.Pending);
  const [adminMessageDraft, setAdminMessageDraft] = useState<string>('');
  const updateStatusMutation =
    TanstackQueryClientService.current.environmentUptimeRequests.useUpdateEnvironmentUptimeRequestStatusMutation();

  // Left-pane search/filter - same predicate the main Uptime Request list
  // feed uses, duplicated rather than shared since this pane's "no card
  // background" styling is deliberately different from that page's own
  // boxed search/filter bar.
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

  const matchedRequest = requests.find((request) => request.ticketId === ticketId);

  let statusVariant: BadgeSharedComponentProps['variant'] = 'neutral';
  if (matchedRequest) {
    if (matchedRequest.status === EnvironmentUptimeRequestStatusEnumModel.Approved) {
      statusVariant = 'info';
    } else if (matchedRequest.status === EnvironmentUptimeRequestStatusEnumModel.Completed) {
      statusVariant = 'success';
    } else if (matchedRequest.status === EnvironmentUptimeRequestStatusEnumModel.Rejected) {
      statusVariant = 'danger';
    } else if (matchedRequest.status === EnvironmentUptimeRequestStatusEnumModel.Pending) {
      statusVariant = 'warning';
    }
  }

  // Re-syncs the drafts whenever the matched ticket (or its own saved
  // status/message) changes - including switching to a different ticket via
  // the left list, which doesn't remount this component since it's just a
  // route param change.
  useEffect(() => {
    if (matchedRequest) {
      setStatusDraft(matchedRequest.status);
      setAdminMessageDraft(matchedRequest.adminMessage ?? '');
    }
  }, [matchedRequest?.id, matchedRequest?.status, matchedRequest?.adminMessage]);

  const isStatusEditDirty = matchedRequest
    ? statusDraft !== matchedRequest.status || adminMessageDraft !== (matchedRequest.adminMessage ?? '')
    : false;

  const handleCancelStatusEdit = (): void => {
    if (matchedRequest) {
      setStatusDraft(matchedRequest.status);
      setAdminMessageDraft(matchedRequest.adminMessage ?? '');
    }
  };

  const handleSaveStatusEdit = (): void => {
    if (!matchedRequest) return;
    updateStatusMutation.mutate({
      id: matchedRequest.id,
      request: {
        status: statusDraft as EnvironmentUptimeRequestStatusEnumModel,
        adminMessage: adminMessageDraft.trim() ? adminMessageDraft.trim() : undefined,
      },
    });
  };

  const handleConfirmDelete = (): void => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
    }
  };

  return (
    <React.Fragment>
    <div className="grid grid-cols-[3fr_7fr] gap-6 h-full items-stretch">
      {/* Left 30%: search/filter + full ticket list - no card background,
          deliberately flatter than the standalone Uptime Request page's own
          boxed search/filter bar. */}
      <div className="flex flex-col gap-4 h-full min-h-0 border-r border-slate-200 dark:border-zinc-800 pr-6">
        <div className="flex flex-col gap-2.5">
          <InputSharedComponent
            placeholder={EnvironmentUptimeRequestsCON.SEARCH_PLACEHOLDER}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          <CustomSelectSharedComponent
            value={selectedStatus}
            options={statusFilterOptions}
            onChange={(val) => setSelectedStatus(val)}
            size="sm"
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-3.5">
          {filteredRequests.length === 0 ? (
            <EmptyStateSharedComponent
              title="No Matching Requests"
              description="Try adjusting your search query or filter to find what you are looking for."
              icon={<SearchX className="w-8 h-8 text-slate-400" />}
            />
          ) : (
            filteredRequests.map((req) => (
              <EnvironmentUptimeRequestCardStaticComponent
                key={req.id}
                request={req}
                onDelete={() => setDeleteTargetId(req.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right 70%: the selected ticket's own detail, as it was before this
          split - its own card now stretches to fill the column's full
          height instead of shrink-wrapping its content. */}
      <div className="flex flex-col gap-6 h-full min-h-0">
        <div className="flex flex-col gap-3 pb-6 border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <Link
            to={ApplicationRouteCON.ENVIRONMENT_UPTIME_REQUESTS}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-[#0C2086] dark:hover:text-sky-400 transition-colors w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {EnvironmentUptimeRequestsCON.DETAIL_BACK_LINK_LABEL}
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-serif-headline text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {ticketId}
            </h1>
            {matchedRequest && (
              <BadgeSharedComponent variant={statusVariant} size="md" showDot>
                {matchedRequest.status}
              </BadgeSharedComponent>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-sm text-slate-400">Loading uptime request...</div>
        ) : !matchedRequest ? (
          <EmptyStateSharedComponent
            title={EnvironmentUptimeRequestsCON.DETAIL_NOT_FOUND_TITLE}
            description={EnvironmentUptimeRequestsCON.DETAIL_NOT_FOUND_DESCRIPTION}
            icon={<SearchX className="w-8 h-8 text-slate-400" />}
          />
        ) : (
          <CardSharedComponent
            variant="card"
            className="flex-1 min-h-0 overflow-y-auto flex flex-col divide-y divide-slate-200 dark:divide-zinc-800 shadow-none p-0"
          >
            <div className="flex divide-x divide-slate-200 dark:divide-zinc-800">
              <DetailFieldRow
                className="flex-1 px-5 py-4"
                icon={<User className="w-4 h-4" />}
                label="Requester Name"
                value={matchedRequest.requesterName}
              />
              <DetailFieldRow
                className="flex-1 px-5 py-4"
                icon={<Globe className="w-4 h-4" />}
                label="Environment"
                value={matchedRequest.environment}
              />
              <DetailFieldRow
                className="flex-1 px-5 py-4"
                icon={<CalendarClock className="w-4 h-4" />}
                label="From (CET)"
                value={CETDateTimeFormatUtility.current.formatDateTime(matchedRequest.fromAt)}
              />
            </div>

            <div className="flex divide-x divide-slate-200 dark:divide-zinc-800">
              <DetailFieldRow
                className="flex-1 px-5 py-4"
                icon={<CalendarClock className="w-4 h-4" />}
                label="To (CET)"
                value={CETDateTimeFormatUtility.current.formatDateTime(matchedRequest.toAt)}
              />
              <DetailFieldRow
                className="flex-1 px-5 py-4"
                icon={<Clock className="w-4 h-4" />}
                label="Submitted"
                value={CETDateTimeFormatUtility.current.formatDateTime(matchedRequest.createdAt)}
              />
              {/* Empty spacer - keeps this row's 2 real fields at the same
                  1/3 width as the row above's 3 fields, so the vertical
                  dividers line up into real columns. */}
              <div className="flex-1 px-5 py-4" aria-hidden="true" />
            </div>

            {matchedRequest.message && (
              <div className="px-5 py-4">
                <DetailFieldRow
                  icon={<FileText className="w-4 h-4" />}
                  label="Message"
                  value={matchedRequest.message}
                  multiline
                />
              </div>
            )}
          </CardSharedComponent>
        )}

        {/* Read-only for everyone (including admins) - a non-admin's only
            view of the admin's note, shown whenever one exists. */}
        {matchedRequest && matchedRequest.adminMessage && (
          <div className="shrink-0 border-l-2 border-[#0C2086]/70 dark:border-sky-500/70 bg-slate-50/60 dark:bg-zinc-900/40 pl-3 pr-2.5 py-2.5 rounded-r-md">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-0.5">
              Note from Admin
            </div>
            <div className="text-sm text-slate-700 dark:text-zinc-200 whitespace-pre-line leading-relaxed">
              {matchedRequest.adminMessage}
            </div>
          </div>
        )}

        {/* Admin-only: change the ticket's status and/or write the note
            above - completely hidden for non-admins. No card background -
            plain 50:50 layout, message on the left, status + Save/Cancel
            on the right. */}
        {matchedRequest && isAdmin && (
          <div className="shrink-0 grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">Note for Requester (Optional)</label>
              <textarea
                value={adminMessageDraft}
                onChange={(e) => setAdminMessageDraft(e.target.value)}
                placeholder="Add a note visible to everyone viewing this ticket..."
                rows={3}
                maxLength={4000}
                className="w-full text-sm px-3 py-2.5 rounded-md bg-white dark:bg-[#0a0a0c] text-slate-900 dark:text-zinc-100 hairline-border-strong focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors resize-y leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5 block">Status</label>
                <CustomSelectSharedComponent
                  value={statusDraft}
                  options={EnvironmentUptimeRequestsCON.STATUS_OPTIONS.map((opt) => ({
                    ...opt,
                    icon: getStatusOptionIcon(opt.value),
                  }))}
                  onChange={setStatusDraft}
                  size="sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <ButtonSharedComponent
                  type="button"
                  onClick={handleCancelStatusEdit}
                  variant="ghost"
                  size="md"
                  disabled={!isStatusEditDirty || updateStatusMutation.isPending}
                >
                  Cancel
                </ButtonSharedComponent>
                <PrimaryActionButtonSharedComponent
                  type="button"
                  onClick={handleSaveStatusEdit}
                  size="md"
                  isLoading={updateStatusMutation.isPending}
                  disabled={!isStatusEditDirty}
                  label="Save"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    <ConfirmationModalSharedComponent
      isOpen={deleteTargetId !== null}
      onClose={() => setDeleteTargetId(null)}
      onConfirm={handleConfirmDelete}
      title={EnvironmentUptimeRequestsCON.DELETE_MODAL_TITLE}
      description={EnvironmentUptimeRequestsCON.DELETE_MODAL_DESCRIPTION}
      confirmText="Delete Request"
      cancelText="Cancel"
      variant="danger"
      isLoading={deleteMutation.isPending}
    />
    </React.Fragment>
  );
}

interface DetailFieldRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  multiline?: boolean;
  className?: string;
}

function DetailFieldRow({ icon, label, value, multiline = false, className = '' }: DetailFieldRowProps): React.JSX.Element {
  return (
    <div className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
        {icon}
        {label}
      </span>
      <span
        className={`text-sm text-slate-900 dark:text-zinc-100 ${multiline ? 'whitespace-pre-line leading-relaxed' : 'truncate'}`}
      >
        {value}
      </span>
    </div>
  );
}
