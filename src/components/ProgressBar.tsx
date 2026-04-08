import { useSurvey } from '../context/SurveyContext';
import { getActivePathSteps } from '../config/stepGraph';
import { useLocation } from 'react-router-dom';

export default function ProgressBar() {
  const { state } = useSurvey();
  const location = useLocation();
  const steps = getActivePathSteps(state);
  const currentPath = location.pathname.replace('/survey/', '');
  const currentIndex = steps.indexOf(currentPath);
  const progress = steps.length > 1 ? ((currentIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="w-full max-w-[500px]">
      <div className="relative h-2 rounded-full bg-gray-200">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-accent transition-all duration-300"
          style={{ width: `${Math.max(progress, 5)}%` }}
        />
      </div>
    </div>
  );
}
