import { useNavigate } from 'react-router-dom';
import { useSurvey, clearSurveyStorage } from '../context/SurveyContext';

interface Props {
  onClose: () => void;
}

export default function CancelModal({ onClose }: Props) {
  const navigate = useNavigate();
  const { dispatch } = useSurvey();

  const handleConfirm = () => {
    dispatch({ type: 'RESET' });
    clearSurveyStorage();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">Cancel Filing Survey?</h3>
        <p className="mt-2 text-base text-gray-600">
          Are you sure? Your progress will be lost.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Go Back
          </button>
          <button
            onClick={handleConfirm}
            className="h-10 rounded-lg bg-danger px-4 text-sm font-semibold text-white hover:bg-danger-hover"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
