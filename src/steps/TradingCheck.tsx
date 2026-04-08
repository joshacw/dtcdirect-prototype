import { useSurvey } from '../context/SurveyContext';
import YesNoToggle from '../components/YesNoToggle';
import { useNavigationConfig } from '../context/NavigationContext';

export default function TradingCheck() {
  const { state, dispatch } = useSurvey();

  useNavigationConfig({
    currentStepId: 'trading-check',
    canContinue: state.tradesOnExchange !== null,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Does this security trade on any public exchanges, external to DTC?
        </h1>
        <p className="mt-1 text-base text-gray-600">
          Indicate whether this security is actively traded on public exchanges outside of DTC.
        </p>
      </div>

      <YesNoToggle
        value={state.tradesOnExchange}
        onChange={v => dispatch({ type: 'SET_FIELD', field: 'tradesOnExchange', value: v })}
      />
    </div>
  );
}
