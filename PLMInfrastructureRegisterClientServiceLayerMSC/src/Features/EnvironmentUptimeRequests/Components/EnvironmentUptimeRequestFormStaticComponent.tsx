import React, { useMemo, useState } from 'react';
import {
  Send,
  RotateCcw,
  CalendarClock,
  Server,
  FlaskConical,
  Code2,
  Box,
  GraduationCap,
  Cpu,
  Plus,
} from 'lucide-react';
import CardSharedComponent from '../../../Shared/Components/CardSharedComponent';
import CustomDateTimePickerSharedComponent from '../../../Shared/Components/CustomDateTimePickerSharedComponent';
import CustomSelectSharedComponent, { type SelectOption } from '../../../Shared/Components/CustomSelectSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../../../Shared/Components/PrimaryActionButtonSharedComponent';
import CreateOptionModalController from '../../../Shared/Components/CreateOptionModalController';
import TanstackQueryClientService from '../../../Services/TanstackQueryClientService';
import EnvironmentNameListUtility from '../../../Utilities/EnvironmentNameListUtility';
import EnvironmentUptimeRequestsCON from '../Constants/EnvironmentUptimeRequestsCON';
import type CreateEnvironmentUptimeRequestInputInterfaceModel from '../../../Models/CreateEnvironmentUptimeRequestInputInterfaceModel';

export interface EnvironmentUptimeRequestFormStaticComponentProps {
  onSubmit: (data: CreateEnvironmentUptimeRequestInputInterfaceModel, onSuccess?: () => void) => void;
  isSubmitting?: boolean;
}

function getEnvironmentOptionIcon(envName: string): React.ReactNode {
  const lower = envName.toLowerCase();
  if (lower.includes('prod')) {
    return <Server className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />;
  }
  if (lower.includes('qa') || lower.includes('test') || lower.includes('staging')) {
    return <FlaskConical className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />;
  }
  if (lower.includes('dev') || lower.includes('migrat') || lower.includes('implement')) {
    return <Code2 className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />;
  }
  if (lower.includes('sandbox')) {
    return <Box className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400 shrink-0" />;
  }
  if (lower.includes('train')) {
    return <GraduationCap className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />;
  }
  return <Cpu className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />;
}

export default function EnvironmentUptimeRequestFormStaticComponent({
  onSubmit,
  isSubmitting = false,
}: EnvironmentUptimeRequestFormStaticComponentProps): React.JSX.Element {
  // Read-only reuse of Environment Overview's existing data - nothing about
  // this feature writes to or modifies EnvironmentOverviewNexus in any way.
  const { data: environmentOverviews = [] } =
    TanstackQueryClientService.current.environmentOverview.useEnvironmentOverviewsQuery();

  const environmentOptions: SelectOption[] = useMemo(
    () =>
      EnvironmentNameListUtility.current
        .splitToIndividualEnvironmentNames(environmentOverviews.map((row) => row.environment))
        .map((name) => ({
          value: name,
          label: name,
          icon: getEnvironmentOptionIcon(name),
        })),
    [environmentOverviews]
  );

  // Requester Name is sourced from the same shared, growable Sponsor options
  // list Environment Overview's own Sponsor dropdown uses - not a separate
  // options list of its own.
  const { data: sponsorOptions = [] } =
    TanstackQueryClientService.current.configurationConstants.useOptionsQuery('Sponsor');
  const sponsorSelectOptions: SelectOption[] = useMemo(
    () => sponsorOptions.map((name) => ({ value: name, label: name })),
    [sponsorOptions]
  );
  const [isCreateSponsorModalOpen, setIsCreateSponsorModalOpen] = useState<boolean>(false);

  const [requesterName, setRequesterName] = useState<string>('');
  const [environment, setEnvironment] = useState<string>('');
  const [fromAt, setFromAt] = useState<string>('');
  const [toAt, setToAt] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [errors, setErrors] = useState<{
    requesterName?: string;
    environment?: string;
    fromAt?: string;
    toAt?: string;
    message?: string;
  }>({});

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};

    if (!requesterName.trim()) {
      nextErrors.requesterName = 'Requester name is required';
    }

    if (!environment.trim()) {
      nextErrors.environment = 'Environment is required';
    }

    if (!fromAt) {
      nextErrors.fromAt = "'From' date/time is required";
    }

    if (!toAt) {
      nextErrors.toAt = "'To' date/time is required";
    } else if (fromAt && new Date(toAt) <= new Date(fromAt)) {
      nextErrors.toAt = "'To' must be strictly after 'From'";
    }

    if (message.trim().length > EnvironmentUptimeRequestsCON.FIELD_MESSAGE_MAX_LENGTH) {
      nextErrors.message = `Message cannot exceed ${EnvironmentUptimeRequestsCON.FIELD_MESSAGE_MAX_LENGTH} characters`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleReset = (): void => {
    setRequesterName('');
    setEnvironment('');
    setFromAt('');
    setToAt('');
    setMessage('');
    setErrors({});
  };

  const handleSubmit = (e?: React.FormEvent): void => {
    if (e) {
      e.preventDefault();
    }
    if (!validate()) {
      return;
    }

    onSubmit(
      {
        requesterName: requesterName.trim(),
        environment: environment.trim(),
        fromAt,
        toAt,
        message: message.trim() ? message.trim() : undefined,
      },
      () => {
        handleReset();
      }
    );
  };

  return (
    <React.Fragment>
    <CardSharedComponent variant="card">
      <div>
        {/* Form Header */}
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-200/80 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-lg bg-[#0C2086]/10 text-[#0C2086] dark:bg-sky-500/20 dark:text-sky-400 flex items-center justify-center shrink-0">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {EnvironmentUptimeRequestsCON.FORM_HEADER_TITLE}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {EnvironmentUptimeRequestsCON.FORM_HEADER_DESCRIPTION}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Requester Name */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5 block">
              {EnvironmentUptimeRequestsCON.FIELD_REQUESTER_LABEL}
            </label>
            <CustomSelectSharedComponent
              value={requesterName}
              options={sponsorSelectOptions}
              onChange={(val) => {
                setRequesterName(val);
                if (errors.requesterName) setErrors((prev) => ({ ...prev, requesterName: undefined }));
              }}
              placeholder={EnvironmentUptimeRequestsCON.FIELD_REQUESTER_PLACEHOLDER}
              searchable
              footerAction={{
                label: 'Add New Sponsor',
                icon: <Plus className="w-3.5 h-3.5" />,
                onClick: () => setIsCreateSponsorModalOpen(true),
              }}
            />
            {errors.requesterName && (
              <span className="text-xs text-rose-500 mt-1 block">{errors.requesterName}</span>
            )}
          </div>

          {/* Environment */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5 block">
              {EnvironmentUptimeRequestsCON.FIELD_ENVIRONMENT_LABEL}
            </label>
            <CustomSelectSharedComponent
              value={environment}
              options={environmentOptions}
              onChange={(val) => {
                setEnvironment(val);
                if (errors.environment) setErrors((prev) => ({ ...prev, environment: undefined }));
              }}
              placeholder={EnvironmentUptimeRequestsCON.FIELD_ENVIRONMENT_PLACEHOLDER}
              searchable
            />
            {errors.environment && (
              <span className="text-xs text-rose-500 mt-1 block">{errors.environment}</span>
            )}
          </div>

          {/* From & To Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomDateTimePickerSharedComponent
              label={EnvironmentUptimeRequestsCON.FIELD_FROM_LABEL}
              value={fromAt}
              onChange={(val) => {
                setFromAt(val);
                if (errors.fromAt) setErrors((prev) => ({ ...prev, fromAt: undefined }));
              }}
              error={errors.fromAt}
              required
            />

            <CustomDateTimePickerSharedComponent
              label={EnvironmentUptimeRequestsCON.FIELD_TO_LABEL}
              value={toAt}
              minDate={fromAt ? fromAt.split('T')[0] : undefined}
              onChange={(val) => {
                setToAt(val);
                if (errors.toAt) setErrors((prev) => ({ ...prev, toAt: undefined }));
              }}
              error={errors.toAt}
              required
            />
          </div>

          {/* Message Textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">
              {EnvironmentUptimeRequestsCON.FIELD_MESSAGE_LABEL}
            </label>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
              }}
              placeholder={EnvironmentUptimeRequestsCON.FIELD_MESSAGE_PLACEHOLDER}
              rows={5}
              maxLength={EnvironmentUptimeRequestsCON.FIELD_MESSAGE_MAX_LENGTH}
              className={`w-full text-sm px-3 py-2.5 rounded-md bg-white dark:bg-[#0a0a0c] text-slate-900 dark:text-zinc-100 hairline-border-strong focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors resize-y leading-relaxed ${
                errors.message ? 'border-red-500 dark:border-red-500' : ''
              }`}
            />
            {errors.message && (
              <span className="text-xs text-rose-500 mt-0.5">{errors.message}</span>
            )}
          </div>
        </form>
      </div>

      {/* Form Bottom Actions */}
      <div className="flex items-center justify-between gap-3 pt-4 mt-6 border-t border-slate-200/80 dark:border-zinc-800">
        <ButtonSharedComponent
          type="button"
          onClick={handleReset}
          variant="ghost"
          size="md"
          icon={<RotateCcw className="w-3.5 h-3.5" />}
          disabled={isSubmitting}
        >
          {EnvironmentUptimeRequestsCON.BUTTON_RESET_LABEL}
        </ButtonSharedComponent>

        <PrimaryActionButtonSharedComponent
          type="button"
          onClick={() => handleSubmit()}
          size="md"
          icon={<Send className="w-3.5 h-3.5" />}
          isLoading={isSubmitting}
          label={EnvironmentUptimeRequestsCON.BUTTON_SUBMIT_LABEL}
        />
      </div>
    </CardSharedComponent>

    <CreateOptionModalController
      isOpen={isCreateSponsorModalOpen}
      onClose={() => setIsCreateSponsorModalOpen(false)}
      fieldName="Sponsor"
      title="Create Sponsor"
      subtitle="Adds a new option to the shared Sponsor list, also used by Environment Overview."
      inputLabel="Sponsor Name"
      inputPlaceholder="e.g. Jane Doe"
      onCreated={(newValue) => setRequesterName(newValue)}
    />
    </React.Fragment>
  );
}
