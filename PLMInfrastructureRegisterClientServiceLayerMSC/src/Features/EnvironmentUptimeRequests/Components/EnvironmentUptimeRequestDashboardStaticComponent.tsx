import React, { useMemo } from 'react';
import { Inbox, Clock, CalendarClock } from 'lucide-react';
import CardSharedComponent from '../../../Shared/Components/CardSharedComponent';
import EmptyStateSharedComponent from '../../../Shared/Components/EmptyStateSharedComponent';
import TanstackQueryClientService from '../../../Services/TanstackQueryClientService';
import CETDateTimeFormatUtility from '../../../Utilities/CETDateTimeFormatUtility';
import EnvironmentUptimeRequestsCON from '../Constants/EnvironmentUptimeRequestsCON';
import { EnvironmentUptimeRequestStatusEnumModel } from '../../../Models/EnvironmentUptimeRequestStatusEnumModel';
import type EnvironmentUptimeRequestInterfaceModel from '../../../Models/EnvironmentUptimeRequestInterfaceModel';

export interface EnvironmentUptimeRequestDashboardStaticComponentProps {
  requests: EnvironmentUptimeRequestInterfaceModel[];
  // True only while this Dashboard view is actually selected - drives the
  // downtime announcements query's `enabled` flag so it doesn't fire while
  // the admin is on Form view (research.md §4).
  isActive: boolean;
}

const DOWNTIME_STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Scheduled: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
};

// Renders two pieces as direct children of the Dashboard view's shared
// grid (see EnvironmentUptimeRequestsScreenController) rather than one
// wrapped block - the lg:row-start-1 cards sit in the SAME grid row as
// the request list's control card (search/filter), so CSS Grid's default
// row-stretch makes them match height automatically, no hardcoded pixel
// value to go stale later.
export default function EnvironmentUptimeRequestDashboardStaticComponent({
  requests,
  isActive,
}: EnvironmentUptimeRequestDashboardStaticComponentProps): React.JSX.Element {
  const summary = useMemo(() => {
    return {
      totalCount: requests.length,
      pendingCount: requests.filter((r) => r.status === EnvironmentUptimeRequestStatusEnumModel.Pending).length,
    };
  }, [requests]);

  const { data: announcements = [] } =
    TanstackQueryClientService.current.downtimeAnnouncements.useAllDowntimeAnnouncementsQuery(isActive);

  const activeAndScheduledAnnouncements = useMemo(
    () => announcements.filter((announcement) => announcement.status === 'Active' || announcement.status === 'Scheduled'),
    [announcements]
  );

  const cards = [
    { label: EnvironmentUptimeRequestsCON.DASHBOARD_CARD_TOTAL_LABEL, value: summary.totalCount, icon: <Inbox className="w-4 h-4" /> },
    { label: EnvironmentUptimeRequestsCON.DASHBOARD_CARD_PENDING_LABEL, value: summary.pendingCount, icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <React.Fragment>
      {/* Summary Cards - row 1, shares its grid row with the Submitted
          Requests control card on the right (same height, matched). */}
      <div className="grid grid-cols-2 gap-3 lg:col-start-1 lg:row-start-1 lg:sticky lg:top-20">
        {cards.map((card) => (
          <CardSharedComponent key={card.label} className="p-4 h-full flex flex-col justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500">
              {card.icon}
              <span className="text-[11px] font-bold uppercase tracking-wider">{card.label}</span>
            </div>
            <span className="text-4xl font-bold text-slate-900 dark:text-white font-serif-headline">{card.value}</span>
          </CardSharedComponent>
        ))}
      </div>

      {/* Active & Upcoming Downtime - row 2. flex flex-col h-full so the
          empty state below can flex-1 and actually fill the grid cell's
          stretched height, instead of floating at its own natural size
          with invisible blank space below it (the cell itself already
          matches the Submitted Requests empty state's cell height via
          CSS Grid's default row-stretch - this just makes the VISIBLE
          content fill it too, on both sides). */}
      <CardSharedComponent className="p-4 lg:col-start-1 lg:row-start-2 flex flex-col h-full">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
          {EnvironmentUptimeRequestsCON.DASHBOARD_DOWNTIME_LIST_TITLE}
        </h3>

        {activeAndScheduledAnnouncements.length === 0 ? (
          <EmptyStateSharedComponent
            icon={<CalendarClock className="w-6 h-6" />}
            title="All Clear"
            description={EnvironmentUptimeRequestsCON.DASHBOARD_DOWNTIME_LIST_EMPTY_STATE}
            bare
            className="flex-1"
          />
        ) : (
          <div className="space-y-2">
            {activeAndScheduledAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{announcement.heading}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${DOWNTIME_STATUS_STYLES[announcement.status] ?? ''}`}>
                      {announcement.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-1">
                    {CETDateTimeFormatUtility.current.formatDateTime(announcement.startAt)} →{' '}
                    {CETDateTimeFormatUtility.current.formatDateTime(announcement.endAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardSharedComponent>
    </React.Fragment>
  );
}
