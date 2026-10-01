import React from 'react';

export interface InputSharedComponentProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  required?: boolean;
  disabled?: boolean;
  name?: string;
}

export default function InputSharedComponent({
  label,
  error,
  icon,
  fullWidth = true,
  className = '',
  placeholder = '',
  value = '',
  onChange,
  type = 'text',
  min,
  max,
  step,
  required = false,
  disabled = false,
  name,
}: InputSharedComponentProps): React.JSX.Element {
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div className={`flex flex-col gap-1.5 ${widthStyle}`}>
      {label && (
        <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-slate-400 dark:text-zinc-500 pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          required={required}
          disabled={disabled}
          className={`h-10 text-sm px-3 py-2 rounded-md bg-white dark:bg-[#0a0a0c] text-slate-900 dark:text-zinc-100 hairline-border-strong focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors duration-200 ${
            icon ? 'pl-9' : ''
          } ${error ? 'border-red-500 dark:border-red-500' : ''} ${className} ${widthStyle}`}
        />
      </div>
      {error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
    </div>
  );
}
