interface Props {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  columns?: number;
}

export default function RadioGrid({ options, value, onChange, columns = 2 }: Props) {
  return (
    <div className={`grid gap-3 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
            value === option
              ? 'border-accent bg-accent-light text-accent'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
              value === option ? 'border-accent bg-accent' : 'border-gray-300'
            }`}>
              {value === option && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            {option}
          </span>
        </button>
      ))}
    </div>
  );
}
