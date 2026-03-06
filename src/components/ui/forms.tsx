import { ReactNode } from 'react';

type FieldShellProps = {
  label: ReactNode;
  required?: boolean;
  error?: string;
  children: ReactNode;
};

export function FieldShell({ label, required, error, children }: FieldShellProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </label>
      {children}
      {error ? <div className="text-sm text-red-700 mt-1">{error}</div> : null}
    </div>
  );
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  className?: string;
};

export function TextInput(props: InputProps) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${className || ''}`}
    />
  );
}

type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
  className?: string;
};

export function SelectInput(props: SelectProps) {
  const { className, ...rest } = props;
  return (
    <select
      {...rest}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${className || ''}`}
    />
  );
}

type TextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
  className?: string;
};

export function TextareaInput(props: TextareaProps) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${className || ''}`}
    />
  );
}

