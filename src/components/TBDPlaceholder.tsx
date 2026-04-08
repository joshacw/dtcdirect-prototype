import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  title?: string;
}

export default function TBDPlaceholder({ title = 'Coming Soon' }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
        <AlertTriangle size={32} className="text-amber-500" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-base text-gray-600">
          This filing type is not yet available. Please check back soon or contact support for assistance.
        </p>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="h-11 rounded-lg border border-gray-300 bg-white px-6 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
      >
        Go Back
      </button>
    </div>
  );
}
