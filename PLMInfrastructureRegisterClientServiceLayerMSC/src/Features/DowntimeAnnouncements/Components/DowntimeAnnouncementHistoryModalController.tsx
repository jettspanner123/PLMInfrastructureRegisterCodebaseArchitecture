import React, { useMemo, useState } from 'react';
import { Pencil, Trash2, Inbox, Search, Layers } from 'lucide-react';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';
import ConfirmationModalSharedComponent from '../../../Shared/Components/ConfirmationModalSharedComponent';
import EmptyStateSharedComponent from '../../../Shared/Components/EmptyStateSharedComponent';
import InputSharedComponent from '../../../Shared/Components/InputSharedComponent';
import CustomSelectSharedComponent, { type SelectOption } from '../../../Shared/Components/CustomSelectSharedComponent';
import DowntimeAnnouncementFormModalController from './DowntimeAnnouncementFormModalController';
import TanstackQueryClientService from '../../../Services/TanstackQueryClientService';
import CETDateTimeFormatUtility from '../../../Utilities/CETDateTimeFormatUtility';
import type DowntimeAnnouncementInterfaceModel from '../../../Models/DowntimeAnnouncementInterfaceModel';

export interface DowntimeAnnouncementHistoryModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  EndedEarly: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Expired: 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400',
  Scheduled: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
};

const STATUS_LABELS: Record<string, string> = {
  Active: 'Active',
  EndedEarly: 'Ended Early',
  Expired: 'Expired',
  Scheduled: 'Scheduled',
};

const FILTER_ALL_STATUSES = 'All';

const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: FILTER_ALL_STATUSES, label: 'All Statuses', icon: <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" /> },
  { value: 'Active', label: 'Active' },
  { value: 'EndedEarly', label: 'Ended Early' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Scheduled', label: 'Scheduled' },
];

export default function DowntimeAnnouncementHistoryModalController({
  isOpen,
  onClose,
}: DowntimeAnnouncementHistoryModalControllerProps): React.JSX.Element {
  const { data: announcements = [], isLoading } =
    TanstackQueryClientService.current.downtimeAnnouncements.useAllDowntimeAnnouncementsQuery(isOpen);

  const [editingAnnouncement, setEditingAnnouncement] = useState<DowntimeAnnouncementInterfaceModel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DowntimeAnnouncementInterfaceModel | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>(FILTER_ALL_STATUSES);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchesHeading = announcement.heading.toLowerCase().includes(query);
        const matchesDescription = announcement.description.toLowerCase().includes(query);
        const matchesEnvironments = announcement.environments.join(', ').toLowerCase().includes(query);
        if (!matchesHeading && !matchesDescription && !matchesEnvironments) return false;
      }

      if (selectedStatus !== FILTER_ALL_STATUSES && announcement.status !== selectedStatus) return false;

      return true;
    });
  }, [announcements, searchQuery, selectedStatus]);

  const deleteMutation = TanstackQueryClientService.current.downtimeAnnouncements.useDeleteDowntimeAnnouncementMutation({
    onSuccess: () => setDeleteTarget(null),
  });

  return (
    <React.Fragment>
      <ModalSharedComponent
        isOpen={isOpen}
        onClose={onClose}
        title="Downtime Announcements"
        subtitle="Every announcement, active and historical."
        maxWidth="3xl"
      >
        <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-4">
          <div className="flex-1">
            <InputSharedComponent
              placeholder="Search by heading, description, or environment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="sm:w-48 shrink-0">
            <CustomSelectSharedComponent
              value={selectedStatus}
              options={STATUS_FILTER_OPTIONS}
              onChange={(val) => setSelectedStatus(val)}
            />
          </div>
        </div>

        {isLoading && <p className="text-sm text-slate-500 dark:text-zinc-400">Loading…</p>}

        {!isLoading && filteredAnnouncements.length === 0 && (
          <EmptyStateSharedComponent
            icon={<Inbox className="w-8 h-8 text-slate-400" />}
            title={announcements.length === 0 ? 'No Downtime Announcements Yet' : 'No Matching Announcements'}
            description={
              announcements.length === 0
                ? 'Create your first announcement using the button above.'
                : 'Try adjusting your search query or filter to find what you are looking for.'
            }
            bare
          />
        )}

        {!isLoading && filteredAnnouncements.length > 0 && (
          <div className="space-y-3">
            {filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{announcement.heading}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_STYLES[announcement.status] ?? ''}`}>
                      {STATUS_LABELS[announcement.status] ?? announcement.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{announcement.description}</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-1">
                    {CETDateTimeFormatUtility.current.formatDateTime(announcement.startAt)} →{' '}
                    {CETDateTimeFormatUtility.current.formatDateTime(announcement.endAt)}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                    {announcement.environments.join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingAnnouncement(announcement)}
                    aria-label={`Edit ${announcement.heading}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(announcement)}
                    aria-label={`Delete ${announcement.heading}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ModalSharedComponent>

      <DowntimeAnnouncementFormModalController
        isOpen={editingAnnouncement !== null}
        onClose={() => setEditingAnnouncement(null)}
        editingAnnouncement={editingAnnouncement}
      />

      <ConfirmationModalSharedComponent
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        title="Delete Downtime Announcement"
        description={`This removes "${deleteTarget?.heading ?? ''}" from the list. If it's currently active, its banner disappears immediately.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
        maxWidth="md"
      />
    </React.Fragment>
  );
}
