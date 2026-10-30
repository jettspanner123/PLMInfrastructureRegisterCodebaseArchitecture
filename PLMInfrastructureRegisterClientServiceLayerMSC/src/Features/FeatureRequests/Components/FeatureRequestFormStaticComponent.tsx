import React, { useMemo, useState } from 'react';
import { Send, RotateCcw, Sparkles, Plus } from 'lucide-react';
import CardSharedComponent from '../../../Shared/Components/CardSharedComponent';
import InputSharedComponent from '../../../Shared/Components/InputSharedComponent';
import CustomSelectSharedComponent, { type SelectOption } from '../../../Shared/Components/CustomSelectSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../../../Shared/Components/PrimaryActionButtonSharedComponent';
import CreateOptionModalController from '../../../Shared/Components/CreateOptionModalController';
import TanstackQueryClientService from '../../../Services/TanstackQueryClientService';
import FeatureRequestsCON from '../Constants/FeatureRequestsCON';
import { FeatureRequestCategoryEnumModel } from '../../../Models/FeatureRequestCategoryEnumModel';
import { FeatureRequestPriorityEnumModel } from '../../../Models/FeatureRequestPriorityEnumModel';
import type CreateFeatureRequestInputInterfaceModel from '../../../Models/CreateFeatureRequestInputInterfaceModel';

export interface FeatureRequestFormStaticComponentProps {
  onSubmit: (data: CreateFeatureRequestInputInterfaceModel, onSuccess?: () => void) => void;
  isSubmitting?: boolean;
}

export default function FeatureRequestFormStaticComponent({
  onSubmit,
  isSubmitting = false,
}: FeatureRequestFormStaticComponentProps): React.JSX.Element {
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>(FeatureRequestCategoryEnumModel.InfrastructureRegister);
  const [priority, setPriority] = useState<string>(FeatureRequestPriorityEnumModel.Medium);
  const [requesterName, setRequesterName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isCreateSponsorModalOpen, setIsCreateSponsorModalOpen] = useState<boolean>(false);

  // Requester Name is sourced from the same shared, growable Sponsor options
  // list Environment Overview's own Sponsor dropdown uses - not a separate
  // options list of its own.
  const { data: sponsorOptions = [] } =
    TanstackQueryClientService.current.configurationConstants.useOptionsQuery('Sponsor');
  const sponsorSelectOptions: SelectOption[] = useMemo(
    () => sponsorOptions.map((name) => ({ value: name, label: name })),
    [sponsorOptions]
  );

  const [errors, setErrors] = useState<{
    title?: string;
    requesterName?: string;
    description?: string;
  }>({});

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};

    if (!title.trim()) {
      nextErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      nextErrors.title = 'Title must be at least 3 characters';
    }

    if (!requesterName.trim()) {
      nextErrors.requesterName = 'Requester name is required';
    }

    if (!description.trim()) {
      nextErrors.description = 'Description is required';
    } else if (description.trim().length < 5) {
      nextErrors.description = 'Description must be at least 5 characters';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleReset = (): void => {
    setTitle('');
    setCategory(FeatureRequestCategoryEnumModel.InfrastructureRegister);
    setPriority(FeatureRequestPriorityEnumModel.Medium);
    setRequesterName('');
    setDescription('');
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
        title: title.trim(),
        category: category as FeatureRequestCategoryEnumModel,
        priority: priority as FeatureRequestPriorityEnumModel,
        requesterName: requesterName.trim(),
        description: description.trim(),
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
          <div className="w-8 h-8 rounded-lg bg-[#0D2086] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {FeatureRequestsCON.FORM_HEADER_TITLE}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {FeatureRequestsCON.FORM_HEADER_DESCRIPTION}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Requester Name */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5 block">
              {FeatureRequestsCON.FIELD_REQUESTER_LABEL}
            </label>
            <CustomSelectSharedComponent
              value={requesterName}
              options={sponsorSelectOptions}
              onChange={(val) => {
                setRequesterName(val);
                if (errors.requesterName) setErrors((prev) => ({ ...prev, requesterName: undefined }));
              }}
              placeholder={FeatureRequestsCON.FIELD_REQUESTER_PLACEHOLDER}
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

          {/* Title */}
          <InputSharedComponent
            label={FeatureRequestsCON.FIELD_TITLE_LABEL}
            placeholder={FeatureRequestsCON.FIELD_TITLE_PLACEHOLDER}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            error={errors.title}
            required
          />

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5 block">
                {FeatureRequestsCON.FIELD_CATEGORY_LABEL}
              </label>
              <CustomSelectSharedComponent
                value={category}
                options={FeatureRequestsCON.CATEGORY_OPTIONS}
                onChange={(val) => setCategory(val)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5 block">
                {FeatureRequestsCON.FIELD_PRIORITY_LABEL}
              </label>
              <CustomSelectSharedComponent
                value={priority}
                options={FeatureRequestsCON.PRIORITY_OPTIONS}
                onChange={(val) => setPriority(val)}
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">
              {FeatureRequestsCON.FIELD_DESCRIPTION_LABEL}
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder={FeatureRequestsCON.FIELD_DESCRIPTION_PLACEHOLDER}
              rows={5}
              required
              className={`w-full text-sm px-3 py-2.5 rounded-md bg-white dark:bg-[#0a0a0c] text-slate-900 dark:text-zinc-100 hairline-border-strong focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors resize-y leading-relaxed ${
                errors.description ? 'border-red-500 dark:border-red-500' : ''
              }`}
            />
            {errors.description && (
              <span className="text-xs text-rose-500 mt-0.5">{errors.description}</span>
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
          {FeatureRequestsCON.BUTTON_RESET_LABEL}
        </ButtonSharedComponent>

        <PrimaryActionButtonSharedComponent
          type="button"
          onClick={() => handleSubmit()}
          size="md"
          icon={<Send className="w-3.5 h-3.5" />}
          isLoading={isSubmitting}
          label={FeatureRequestsCON.BUTTON_SUBMIT_LABEL}
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
