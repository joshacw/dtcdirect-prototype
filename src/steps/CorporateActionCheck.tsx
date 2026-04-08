import { useSurvey } from '../context/SurveyContext';
import { corporateActionOptions } from '../config/securityTypes';
import RadioGrid from '../components/RadioGrid';
import NoneOfAbove from '../components/NoneOfAbove';
import { useNavigationConfig } from '../context/NavigationContext';

export default function CorporateActionCheck() {
  const { state, dispatch } = useSurvey();

  const handleChange = (value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'corporateAction', value });
  };

  const handleNone = () => {
    dispatch({ type: 'SET_FIELD', field: 'corporateAction', value: 'None' });
  };

  const canContinue = !!state.corporateAction;

  useNavigationConfig({
    currentStepId: 'corporate-action',
    canContinue,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Does this pertain to any of the following?
        </h1>
        <p className="mt-1 text-base text-gray-600">
          Confirm if this filing pertains to any corporate actions as listed below, or select none of the above.
        </p>
      </div>

      <RadioGrid
        options={corporateActionOptions}
        value={state.corporateAction === 'None' ? '' : state.corporateAction}
        onChange={handleChange}
      />

      <NoneOfAbove
        selected={state.corporateAction === 'None'}
        onClick={handleNone}
      />
    </div>
  );
}
