import type { ReactNode } from 'react';

interface Props {
  label: ReactNode;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function TextInput({ label, required, value, onChange, placeholder }: Props) {
  return (
    <div className="flex w-full flex-col gap-1">
      <label className="flex items-center gap-0.5 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-danger">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-input-border bg-white px-3 text-base text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
      />
    </div>
  );
}
