import React, { useEffect, useMemo, useState } from 'react';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';
import InputSharedComponent from '../../../Shared/Components/InputSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../../../Shared/Components/PrimaryActionButtonSharedComponent';
import CustomDateTimePickerSharedComponent from '../../../Shared/Components/CustomDateTimePickerSharedComponent';
import CustomSelectSharedComponent, { type SelectOption } from '../../../Shared/Components/CustomSelectSharedComponent';
import TanstackQueryClientService from '../../../Services/TanstackQueryClientService';
import EnvironmentNameListUtility from '../../../Utilities/EnvironmentNameListUtility';
import type DowntimeAnnouncementInterfaceModel from '../../../Models/DowntimeAnnouncementInterfaceModel';

export interface DowntimeAnnouncementFormModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
  // When present, the form pre-fills from it and submitting calls the
  // update mutation (by this announcement's id) instead of create - same
  // form, reused for both create and edit (research.md §10).
  editingAnnouncement?: DowntimeAnnouncementInterfaceModel | null;
}

// Inverse of the backend's CETTimeZoneUtility.ToUtc: a stored UTC ISO
// timestamp back into the fixed-CET (UTC+1, never DST-shifted)
// "YYYY-MM-DDTHH:mm" shape CustomDateTimePickerSharedComponent's value
// expects - independent of the viewing browser's own local timezone.
function utcIsoToCetDateTimeLocal(isoUtcTimestamp: string): string {
  const cetDate = new Date(new Date(isoUtcTimestamp).getTime() + 60 * 60 * 1000);
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${cetDate.getUTCFullYear()}-${pad(cetDate.getUTCMonth() + 1)}-${pad(cetDate.getUTCDate())}T${pad(cetDate.getUTCHours())}:${pad(cetDate.getUTCMinutes())}`;
}

export default function DowntimeAnnouncementFormModalController({
  isOpen,
  onClose,
  editingAnnouncement,
}: DowntimeAnnouncementFormModalControllerProps): React.JSX.Element {
  // Read-only reuse of Environment Overview's existing data, same source
  // EnvironmentUptimeRequestFormStaticComponent's own environment picker
  // already uses.
  const { data: environmentOverviews = [] } =
    TanstackQueryClientService.current.environmentOverview.useEnvironmentOverviewsQuery();

  const environmentOptions: SelectOption[] = useMemo(
    () =>
      EnvironmentNameListUtility.current
        .splitToIndividualEnvironmentNames(environmentOverviews.map((row) => row.environment))
        .map((name) => ({ value: name, label: name })),
    [environmentOverviews]
  );

  const [heading, setHeading] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startAt, setStartAt] = useState<string>('');
  const [endAt, setEndAt] = useState<string>('');
  const [environments, setEnvironments] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    heading?: string;
    description?: string;
    startAt?: string;
    endAt?: string;
    environments?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      if (editingAnnouncement) {
        setHeading(editingAnnouncement.heading);
        setDescription(editingAnnouncement.description);
        setStartAt(utcIsoToCetDateTimeLocal(editingAnnouncement.startAt));
        setEndAt(utcIsoToCetDateTimeLocal(editingAnnouncement.endAt));
        setEnvironments(editingAnnouncement.environments);
      } else {
        setHeading('');
        setDescription('');
        setStartAt('');
        setEndAt('');
        setEnvironments([]);
      }
      setErrors({});
    }
  }, [isOpen, editingAnnouncement]);

  const createMutation = TanstackQueryClientService.current.downtimeAnnouncements.useCreateDowntimeAnnouncementMutation({
    onSuccess: () => onClose(),
  });

  const updateMutation = TanstackQueryClientService.current.downtimeAnnouncements.useUpdateDowntimeAnnouncementMutation({
    onSuccess: () => onClose(),
  });

  const isEditing = Boolean(editingAnnouncement);
  const isPending = isEditing ? updateMutation.isPending : createMutation.isPending;

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};

    if (!heading.trim()) nextErrors.heading = 'Heading is required.';
    if (!description.trim()) nextErrors.description = 'Description is required.';
    if (!startAt) nextErrors.startAt = "'Start' is required.";
    if (!endAt) nextErrors.endAt = "'End' is required.";
    if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
      nextErrors.endAt = "'End' must be after 'Start'.";
    }
    if (environments.length === 0) nextErrors.environments = 'Select at least one environment.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (): void => {
    if (!validate()) return;

    const request = {
      heading: heading.trim(),
      description: description.trim(),
      startAt,
      endAt,
      environments,
    };

    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, request });
    } else {
      createMutation.mutate(request);
    }
  };

  const isSubmitDisabled =
    !heading.trim() || !description.trim() || !startAt || !endAt || environments.length === 0;

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Downtime Announcement' : 'Create Downtime Announcement'}
      subtitle="Shown to every user on the Uptime Request page while it's active."
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <ButtonSharedComponent variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </ButtonSharedComponent>
          <PrimaryActionButtonSharedComponent
            label={isEditing ? 'Save' : 'Create'}
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            isLoading={isPending}
          />
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-x-6">
        {/* Left column: Heading + Description. Description stretches
            (flex-1, no fixed rows) to match the right column's height. */}
        <div className="flex flex-col gap-4">
          <InputSharedComponent
            label="Heading"
            placeholder="e.g. Production environment down for maintenance"
            value={heading}
            onChange={(event) => {
              setHeading(event.target.value);
              if (errors.heading) setErrors((previous) => ({ ...previous, heading: undefined }));
            }}
            error={errors.heading}
            required
          />

          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">Description</label>
            <textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                if (errors.description) setErrors((previous) => ({ ...previous, description: undefined }));
              }}
              placeholder="What's happening, and why."
              maxLength={4000}
              className={`w-full flex-1 min-h-[7rem] text-sm px-3 py-2.5 rounded-md bg-white dark:bg-[#0a0a0c] text-slate-900 dark:text-zinc-100 hairline-border-strong focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors resize-y leading-relaxed ${
                errors.description ? 'border-red-500 dark:border-red-500' : ''
              }`}
            />
            {errors.description && <span className="text-xs text-rose-500 mt-0.5">{errors.description}</span>}
          </div>
        </div>

        {/* Right column: Start, End, Affected Environments. */}
        <div className="flex flex-col gap-4">
          <div>
            <CustomDateTimePickerSharedComponent
              label="Start"
              value={startAt}
              onChange={(value) => {
                setStartAt(value);
                if (errors.startAt) setErrors((previous) => ({ ...previous, startAt: undefined }));
              }}
              required
            />
            {errors.startAt && <span className="text-xs text-rose-500 mt-0.5 block">{errors.startAt}</span>}
          </div>

          <div>
            <CustomDateTimePickerSharedComponent
              label="End"
              value={endAt}
              minDate={startAt ? startAt.split('T')[0] : undefined}
              onChange={(value) => {
                setEndAt(value);
                if (errors.endAt) setErrors((previous) => ({ ...previous, endAt: undefined }));
              }}
              required
            />
            {errors.endAt && <span className="text-xs text-rose-500 mt-0.5 block">{errors.endAt}</span>}
          </div>

          <div>
            <CustomSelectSharedComponent
              label="Affected Environments"
              multiple
              values={environments}
              onChangeMultiple={(values) => {
                setEnvironments(values);
                if (errors.environments) setErrors((previous) => ({ ...previous, environments: undefined }));
              }}
              options={environmentOptions}
              placeholder="Select environments"
              searchable
            />
            {errors.environments && <span className="text-xs text-rose-500 mt-0.5 block">{errors.environments}</span>}
          </div>
        </div>
      </div>
    </ModalSharedComponent>
  );
}
