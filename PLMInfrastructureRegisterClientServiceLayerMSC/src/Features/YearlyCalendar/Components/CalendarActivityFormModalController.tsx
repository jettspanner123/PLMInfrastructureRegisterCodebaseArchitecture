import React, { useEffect, useMemo, useState } from 'react';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';
import InputSharedComponent from '../../../Shared/Components/InputSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../../../Shared/Components/PrimaryActionButtonSharedComponent';
import CustomDateTimePickerSharedComponent from '../../../Shared/Components/CustomDateTimePickerSharedComponent';
import CustomSelectSharedComponent, { type SelectOption } from '../../../Shared/Components/CustomSelectSharedComponent';
import TanstackQueryClientService from '../../../Services/TanstackQueryClientService';
import EnvironmentNameListUtility from '../../../Utilities/EnvironmentNameListUtility';

export interface CalendarActivityFormModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Same plausible-shape-only email check as EnvironmentUptimeRequestFormStaticComponent's
// own EMAIL_PATTERN, mirroring the backend's CalendarActivitiesAssertion.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CalendarActivityFormModalController({
  isOpen,
  onClose,
}: CalendarActivityFormModalControllerProps): React.JSX.Element {
  // Same source as EnvironmentUptimeRequestFormStaticComponent's own
  // Environment dropdown (data-model.md).
  const { data: environmentOverviews = [] } =
    TanstackQueryClientService.current.environmentOverview.useEnvironmentOverviewsQuery();

  const environmentOptions: SelectOption[] = useMemo(
    () =>
      EnvironmentNameListUtility.current
        .splitToIndividualEnvironmentNames(environmentOverviews.map((row) => row.environment))
        .map((name) => ({ value: name, label: name })),
    [environmentOverviews]
  );

  // Same shared, growable Sponsor options list as Uptime Request's own
  // Requester Name dropdown (data-model.md).
  const { data: sponsorOptions = [] } =
    TanstackQueryClientService.current.configurationConstants.useOptionsQuery('Sponsor');
  const sponsorSelectOptions: SelectOption[] = useMemo(
    () => sponsorOptions.map((name) => ({ value: name, label: name })),
    [sponsorOptions]
  );

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [environment, setEnvironment] = useState<string>('');
  const [responsiblePerson, setResponsiblePerson] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [startAt, setStartAt] = useState<string>('');
  const [endAt, setEndAt] = useState<string>('');

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    environment?: string;
    responsiblePerson?: string;
    contactEmail?: string;
    startAt?: string;
    endAt?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setEnvironment('');
      setResponsiblePerson('');
      setContactEmail('');
      setStartAt('');
      setEndAt('');
      setErrors({});
    }
  }, [isOpen]);

  const createMutation = TanstackQueryClientService.current.calendarActivities.useCreateCalendarActivityMutation({
    onSuccess: () => onClose(),
  });

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};

    if (!title.trim()) nextErrors.title = 'Title is required.';
    else if (title.trim().length > 200) nextErrors.title = 'Title cannot exceed 200 characters.';

    if (!description.trim()) nextErrors.description = 'Description is required.';
    else if (description.trim().length > 4000) nextErrors.description = 'Description cannot exceed 4000 characters.';

    if (!environment.trim()) nextErrors.environment = 'Environment is required.';
    if (!responsiblePerson.trim()) nextErrors.responsiblePerson = 'Responsible person is required.';

    if (!contactEmail.trim()) nextErrors.contactEmail = 'Contact email is required.';
    else if (!EMAIL_PATTERN.test(contactEmail.trim())) nextErrors.contactEmail = 'Enter a valid email address.';

    if (!startAt) nextErrors.startAt = "'Start' is required.";
    if (!endAt) nextErrors.endAt = "'End' is required.";
    if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
      nextErrors.endAt = "'End' must be strictly after 'Start'.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (): void => {
    if (!validate()) return;

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      environment: environment.trim(),
      responsiblePerson: responsiblePerson.trim(),
      contactEmail: contactEmail.trim(),
      startAt,
      endAt,
    });
  };

  const isSubmitDisabled =
    !title.trim() ||
    !description.trim() ||
    !environment.trim() ||
    !responsiblePerson.trim() ||
    !contactEmail.trim() ||
    !startAt ||
    !endAt;

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={onClose}
      title="Add Activity"
      subtitle="Shown to every visitor on the Yearly Calendar page."
      maxWidth="3xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <ButtonSharedComponent variant="outline" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </ButtonSharedComponent>
          <PrimaryActionButtonSharedComponent
            label="Create"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            isLoading={createMutation.isPending}
          />
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-x-6">
        <div className="flex flex-col gap-4">
          <InputSharedComponent
            label="Title"
            placeholder="e.g. Release Deployment"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (errors.title) setErrors((previous) => ({ ...previous, title: undefined }));
            }}
            error={errors.title}
            required
            surface="onCard"
          />

          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">
              Description<span className="text-rose-500 ml-0.5">*</span>
            </label>
            <textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                if (errors.description) setErrors((previous) => ({ ...previous, description: undefined }));
              }}
              placeholder="What this activity is and why it's happening."
              maxLength={4000}
              className={`w-full flex-1 min-h-[7rem] text-sm px-3 py-2.5 rounded-md bg-white dark:bg-[#202020] text-slate-900 dark:text-zinc-100 hairline-border-strong focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors resize-y leading-relaxed ${
                errors.description ? 'border-red-500 dark:border-red-500' : ''
              }`}
            />
            {errors.description && <span className="text-xs text-rose-500 mt-0.5">{errors.description}</span>}
          </div>

          <InputSharedComponent
            label="Contact Email"
            placeholder="name@example.com"
            type="email"
            value={contactEmail}
            onChange={(event) => {
              setContactEmail(event.target.value);
              if (errors.contactEmail) setErrors((previous) => ({ ...previous, contactEmail: undefined }));
            }}
            error={errors.contactEmail}
            required
            surface="onCard"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5 block">
              Environment<span className="text-rose-500 ml-0.5">*</span>
            </label>
            <CustomSelectSharedComponent
              value={environment}
              options={environmentOptions}
              onChange={(value) => {
                setEnvironment(value);
                if (errors.environment) setErrors((previous) => ({ ...previous, environment: undefined }));
              }}
              placeholder="Select environment"
              searchable
              surface="onCard"
            />
            {errors.environment && <span className="text-xs text-rose-500 mt-1 block">{errors.environment}</span>}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5 block">
              Responsible Person<span className="text-rose-500 ml-0.5">*</span>
            </label>
            <CustomSelectSharedComponent
              value={responsiblePerson}
              options={sponsorSelectOptions}
              onChange={(value) => {
                setResponsiblePerson(value);
                if (errors.responsiblePerson) setErrors((previous) => ({ ...previous, responsiblePerson: undefined }));
              }}
              placeholder="Select responsible person"
              searchable
              surface="onCard"
            />
            {errors.responsiblePerson && (
              <span className="text-xs text-rose-500 mt-1 block">{errors.responsiblePerson}</span>
            )}
          </div>

          <div>
            <CustomDateTimePickerSharedComponent
              label="Start"
              value={startAt}
              onChange={(value) => {
                setStartAt(value);
                if (errors.startAt) setErrors((previous) => ({ ...previous, startAt: undefined }));
              }}
              required
              surface="onCard"
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
              surface="onCard"
            />
            {errors.endAt && <span className="text-xs text-rose-500 mt-0.5 block">{errors.endAt}</span>}
          </div>
        </div>
      </div>
    </ModalSharedComponent>
  );
}
