import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

interface BaseFieldProps {
  label: string;
  hint?: string;
  error?: string;
  rightAddon?: ReactNode;
}

type TextFieldProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement> & {
  kind?: 'input';
};

type SelectFieldProps = BaseFieldProps & SelectHTMLAttributes<HTMLSelectElement> & {
  kind: 'select';
  options: Array<{ label: string; value: string }>;
};

export type FormFieldProps = TextFieldProps | SelectFieldProps;

const wrapperClass = 'w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] px-4 py-3 text-sm text-[var(--color-title)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]';

export const FormField = (props: FormFieldProps): JSX.Element => {
  const { label, hint, error, rightAddon } = props;

  return (
    <label className="flex w-full flex-col gap-2">
      <span className="text-sm font-semibold text-[var(--color-title)]">{label}</span>
      <div className="relative">
        {props.kind === 'select' ? (
          <select {...props} className={`${wrapperClass} appearance-none pr-10 ${props.className ?? ''}`}>
            {props.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input {...props} className={`${wrapperClass} ${props.className ?? ''}`} />
        )}
        {rightAddon ? <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-subtle)]">{rightAddon}</div> : null}
      </div>
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-[var(--color-subtle)]">{hint}</span> : null}
    </label>
  );
};
