import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../context/SurveyContext';
import { stepGraph } from '../config/stepGraph';
import CancelModal from './CancelModal';

interface Props {
  currentStepId: string;
  canContinue: boolean;
  onContinue?: () => void;
  continueLabel?: string;
}

export default function StepNavigation({ currentStepId, canContinue, onContinue, continueLabel = 'Continue' }: Props) {
  const navigate = useNavigate();
  const { state, dispatch } = useSurvey();
  const [showCancel, setShowCancel] = useState(false);
  const step = stepGraph[currentStepId];

  const handleBack = () => {
    const prevId = step?.getPrev(state);
    if (prevId && stepGraph[prevId]) {
      navigate(stepGraph[prevId].path);
    }
  };

  const handleContinue = () => {
    if (onContinue) onContinue();

    dispatch({ type: 'MARK_COMPLETE', stepId: currentStepId });

    if (state.returnToReview) {
      dispatch({ type: 'SET_RETURN_TO_REVIEW', editOriginStep: null });
      navigate('/survey/review');
      return;
    }

    const nextId = step?.getNext(state);
    if (nextId && stepGraph[nextId]) {
      navigate(stepGraph[nextId].path);
    }
  };

  const prevId = step?.getPrev(state);

  return (
    <>
      <div className="flex w-full items-end justify-between">
        <div>
          {prevId && (
            <button
              onClick={handleBack}
              className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Back
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCancel(true)}
            className="text-base font-medium text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`h-11 rounded-lg px-5 text-base font-semibold shadow-sm transition ${
              canContinue
                ? 'bg-primary text-white hover:bg-primary-hover'
                : 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400'
            }`}
          >
            {continueLabel}
          </button>
        </div>
      </div>
      {showCancel && <CancelModal onClose={() => setShowCancel(false)} />}
    </>
  );
}
