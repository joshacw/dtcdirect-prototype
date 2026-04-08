import { Check } from 'lucide-react';

interface Props {
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  columns?: number;
}

export default function CheckboxGrid({ options, values, onChange, columns = 2 }: Props) {
  const toggle = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter(v => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  return (
    <div className={`grid gap-3 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => toggle(option)}
          className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
            values.includes(option)
              ? 'border-accent bg-accent-light text-accent'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
              values.includes(option) ? 'border-accent bg-accent' : 'border-gray-300'
            }`}>
              {values.includes(option) && <Check size={10} className="text-white" />}
            </span>
            {option}
          </span>
        </button>
      ))}
    </div>
  );
}
