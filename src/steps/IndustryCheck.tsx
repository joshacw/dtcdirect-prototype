import { useState } from 'react';
import { useSurvey } from '../context/SurveyContext';
import { industryOptions } from '../config/securityTypes';
import RadioGrid from '../components/RadioGrid';
import NoneOfAbove from '../components/NoneOfAbove';
import { useNavigationConfig } from '../context/NavigationContext';

export default function IndustryCheck() {
  const { state, dispatch } = useSurvey();
  const [noneSelected, setNoneSelected] = useState(
    state.industries.length === 0 && state.completedSteps.includes('industry-check')
  );

  const handleIndustryChange = (value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'industries', value: [value] });
    setNoneSelected(false);
  };

  const handleNone = () => {
    dispatch({ type: 'SET_FIELD', field: 'industries', value: [] });
    setNoneSelected(true);
  };

  const canContinue = noneSelected || state.industries.length > 0;

  useNavigationConfig({
    currentStepId: 'industry-check',
    canContinue,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Industry Classification</h1>
        <p className="mt-1 text-base text-gray-600">
          Select the industry that best represents the nature of your company's operations.
        </p>
      </div>

      <RadioGrid
        options={industryOptions}
        value={state.industries[0] || ''}
        onChange={handleIndustryChange}
      />

      <NoneOfAbove selected={noneSelected} onClick={handleNone} />
    </div>
  );
}
