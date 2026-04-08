import { Check, X } from 'lucide-react';

interface Props {
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export default function YesNoToggle({ value, onChange }: Props) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border text-base font-medium transition ${
          value === true
            ? 'border-accent bg-accent-light text-accent'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
        }`}
      >
        <Check size={16} /> Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border text-base font-medium transition ${
          value === false
            ? 'border-accent bg-accent-light text-accent'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
        }`}
      >
        <X size={16} /> No
      </button>
    </div>
  );
}
