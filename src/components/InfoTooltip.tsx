import { useState, useRef } from 'react';
import { HelpCircle } from 'lucide-react';

interface Props {
  text?: string;
}

export default function InfoTooltip({ text = 'Click here to learn more' }: Props) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleEnter = () => {
    clearTimeout(timeoutRef.current);
    setShow(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setShow(false), 150);
  };

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        className="ml-1 inline-flex text-gray-400 hover:text-gray-600"
      >
        <HelpCircle size={14} />
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary" />
        </span>
      )}
    </span>
  );
}
