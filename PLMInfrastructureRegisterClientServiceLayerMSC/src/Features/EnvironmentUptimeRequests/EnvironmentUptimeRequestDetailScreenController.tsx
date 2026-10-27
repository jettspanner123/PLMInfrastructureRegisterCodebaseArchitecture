import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { ArrowLeft, Globe, CalendarClock, Clock, FileText, SearchX } from 'lucide-react';
import CardSharedComponent from '../../Shared/Components/CardSharedComponent';
import BadgeSharedComponent, { type BadgeSharedComponentProps } from '../../Shared/Components/BadgeSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import ApplicationRouteCON from '../../Constants/ApplicationRouteCON';
import CETDateTimeFormatUtility from '../../Utilities/CETDateTimeFormatUtility';
import EnvironmentUptimeRequestsCON from './Constants/EnvironmentUptimeRequestsCON';
import { EnvironmentUptimeRequestStatusEnumModel } from '../../Models/EnvironmentUptimeRequestStatusEnumModel';

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

  // Reuses the same list already fetched via TanStack Query on every mount
  // (including a hard refresh) and finds the matching row client-side -
  // there is no dedicated GET-by-ticket-id endpoint. A soft-deleted ticket
  // naturally renders "not found" here, since it no longer appears in the
  // list at all.
  const { data: requests = [], isLoading } =
    TanstackQueryClientService.current.environmentUptimeRequests.useEnvironmentUptimeRequestsQuery();

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

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      {/* Detail Page Header */}
      <div className="flex flex-col gap-3 pb-6 border-b border-slate-200 dark:border-zinc-800">
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
        <CardSharedComponent variant="elevated" className="flex flex-col gap-5">
          <DetailFieldRow icon={<Globe className="w-4 h-4" />} label="Environment" value={matchedRequest.environment} />

          <DetailFieldRow
            icon={<CalendarClock className="w-4 h-4" />}
            label="From (CET)"
            value={CETDateTimeFormatUtility.current.formatDateTime(matchedRequest.fromAt)}
          />

          <DetailFieldRow
            icon={<CalendarClock className="w-4 h-4" />}
            label="To (CET)"
            value={CETDateTimeFormatUtility.current.formatDateTime(matchedRequest.toAt)}
          />

          {matchedRequest.message && (
            <DetailFieldRow
              icon={<FileText className="w-4 h-4" />}
              label="Message"
              value={matchedRequest.message}
              multiline
            />
          )}

          <DetailFieldRow
            icon={<Clock className="w-4 h-4" />}
            label="Submitted"
            value={CETDateTimeFormatUtility.current.formatDateTime(matchedRequest.createdAt)}
          />
        </CardSharedComponent>
      )}
    </div>
  );
}

interface DetailFieldRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  multiline?: boolean;
}

function DetailFieldRow({ icon, label, value, multiline = false }: DetailFieldRowProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5 pb-5 border-b border-slate-100 dark:border-zinc-800/80 last:border-b-0 last:pb-0">
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
        {icon}
        {label}
      </span>
      <span
        className={`text-sm text-slate-900 dark:text-zinc-100 ${multiline ? 'whitespace-pre-line leading-relaxed' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}
