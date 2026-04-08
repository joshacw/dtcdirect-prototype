import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export default function SearchableDropdown({ label, required, value, onChange, options, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex w-full flex-col gap-1" ref={ref}>
      <label className="flex items-center gap-0.5 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-danger">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`flex h-11 w-full items-center justify-between rounded-md border bg-white px-3 text-base shadow-sm ${
            open ? 'border-accent ring-1 ring-accent' : 'border-input-border'
          } ${value ? 'text-gray-900' : 'text-gray-500'}`}
        >
          <span className="truncate">{value || placeholder || 'Select...'}</span>
          <ChevronDown size={18} className="shrink-0 text-gray-400" />
        </button>
        {open && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="p-2">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                autoFocus
                className="h-9 w-full rounded border border-gray-200 px-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              />
            </div>
            <ul className="max-h-60 overflow-auto py-1">
              {filtered.map(option => (
                <li
                  key={option}
                  onClick={() => { onChange(option); setOpen(false); setSearch(''); }}
                  className={`cursor-pointer px-3 py-2 text-sm hover:bg-accent-light ${
                    option === value ? 'bg-accent-light font-medium text-accent' : 'text-gray-700'
                  }`}
                >
                  {option}
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-400">No results found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
