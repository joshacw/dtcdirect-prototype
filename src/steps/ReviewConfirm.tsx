import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../context/SurveyContext';
import ReviewSection from '../components/ReviewSection';
import { useNavigationConfig } from '../context/NavigationContext';

export default function ReviewConfirm() {
  const navigate = useNavigate();
  const { state, dispatch } = useSurvey();

  // Clear returnToReview flag on mount
  if (state.returnToReview) {
    dispatch({ type: 'SET_RETURN_TO_REVIEW', editOriginStep: null });
  }

  // Hide standard nav for review screen
  useNavigationConfig({ currentStepId: 'review', canContinue: false });

  const handleConfirm = () => {
    dispatch({ type: 'MARK_COMPLETE', stepId: 'review' });
    navigate('/auth', { state: { source: 'survey' } });
  };

  const corporateInfoItems = [
    { label: 'Company Name', value: state.corporateName },
    { label: 'Country of Origin', value: state.country },
  ];
  if (state.usState) {
    corporateInfoItems.push({ label: 'State', value: state.usState });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Review & Submit</h1>
        <p className="mt-1 text-base text-gray-600">
          Verify all details before submitting your application for invoice processing. Once submitted, an invoice will be generated with applicable fees.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <ReviewSection
          title="Corporate Information"
          editStepId="corporate-name"
          items={corporateInfoItems}
        />

        <ReviewSection
          title="Security Details"
          editStepId="security-type"
          items={[
            { label: 'Security Type', value: state.securityType },
          ]}
        />

        <ReviewSection
          title="Corporate Action"
          editStepId="corporate-action"
          items={[
            { label: 'Corporate Action Type', value: state.corporateAction === 'None' ? 'None of the Above' : (state.corporateAction || 'None of the Above') },
          ]}
        />

        {state.corporateAction === 'None' && (
          <ReviewSection
            title="Security & Trading Check"
            editStepId="trading-check"
            items={[
              {
                label: 'Trades on Public Exchange External to DTC',
                value: state.tradesOnExchange === true ? 'Yes' : state.tradesOnExchange === false ? 'No' : '—',
              },
            ]}
          />
        )}
      </div>

      <div className="mt-auto flex w-full justify-center">
        <button
          onClick={handleConfirm}
          className="h-11 rounded-lg bg-primary px-6 text-base font-semibold text-white shadow-sm hover:bg-primary-hover"
        >
          Confirm & Proceed
        </button>
      </div>
    </div>
  );
}
