import React, { useMemo, useState } from 'react';
import { Send, RotateCcw, CalendarClock } from 'lucide-react';
import CardSharedComponent from '../../../Shared/Components/CardSharedComponent';
import InputSharedComponent from '../../../Shared/Components/InputSharedComponent';
import CustomSelectSharedComponent, { type SelectOption } from '../../../Shared/Components/CustomSelectSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../../../Shared/Components/PrimaryActionButtonSharedComponent';
import TanstackQueryClientService from '../../../Services/TanstackQueryClientService';
import EnvironmentNameListUtility from '../../../Utilities/EnvironmentNameListUtility';
import EnvironmentUptimeRequestsCON from '../Constants/EnvironmentUptimeRequestsCON';
import type CreateEnvironmentUptimeRequestInputInterfaceModel from '../../../Models/CreateEnvironmentUptimeRequestInputInterfaceModel';

export interface EnvironmentUptimeRequestFormStaticComponentProps {
  onSubmit: (data: CreateEnvironmentUptimeRequestInputInterfaceModel) => void;
  isSubmitting?: boolean;
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
        .map((name) => ({ value: name, label: name })),
    [environmentOverviews]
  );

  const [environment, setEnvironment] = useState<string>('');
  const [fromAt, setFromAt] = useState<string>('');
  const [toAt, setToAt] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [errors, setErrors] = useState<{
    environment?: string;
    fromAt?: string;
    toAt?: string;
    message?: string;
  }>({});

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};

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

  const handleSubmit = (e?: React.FormEvent): void => {
    if (e) {
      e.preventDefault();
    }
    if (!validate()) {
      return;
    }

    onSubmit({
      environment: environment.trim(),
      fromAt,
      toAt,
      message: message.trim() ? message.trim() : undefined,
    });
  };

  const handleReset = (): void => {
    setEnvironment('');
    setFromAt('');
    setToAt('');
    setMessage('');
    setErrors({});
  };

  return (
    <CardSharedComponent variant="elevated" className="h-full flex flex-col justify-between">
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
            <InputSharedComponent
              label={EnvironmentUptimeRequestsCON.FIELD_FROM_LABEL}
              type="datetime-local"
              value={fromAt}
              onChange={(e) => {
                setFromAt(e.target.value);
                if (errors.fromAt) setErrors((prev) => ({ ...prev, fromAt: undefined }));
              }}
              error={errors.fromAt}
              required
            />

            <InputSharedComponent
              label={EnvironmentUptimeRequestsCON.FIELD_TO_LABEL}
              type="datetime-local"
              value={toAt}
              onChange={(e) => {
                setToAt(e.target.value);
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
  );
}
