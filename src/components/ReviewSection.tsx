import { Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../context/SurveyContext';
import { stepGraph } from '../config/stepGraph';

interface ReviewItem {
  label: string;
  value: string;
}

interface Props {
  title: string;
  items: ReviewItem[];
  editStepId: string;
}

export default function ReviewSection({ title, items, editStepId }: Props) {
  const navigate = useNavigate();
  const { dispatch } = useSurvey();

  const handleEdit = () => {
    dispatch({ type: 'SET_RETURN_TO_REVIEW', editOriginStep: editStepId });
    navigate(stepGraph[editStepId].path);
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <button
          onClick={handleEdit}
          className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          <Pencil size={14} /> Edit
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {items.map(item => (
          <div key={item.label} className="flex justify-between text-sm">
            <span className="text-gray-500">{item.label}</span>
            <span className="font-medium text-gray-900">{item.value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
