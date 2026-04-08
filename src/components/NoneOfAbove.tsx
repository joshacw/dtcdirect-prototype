import { X } from 'lucide-react';

interface Props {
  selected: boolean;
  onClick: () => void;
}

export default function NoneOfAbove({ selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition ${
        selected
          ? 'border-accent bg-accent-light text-accent'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
      }`}
    >
      <X size={14} /> None of the above
    </button>
  );
}
