import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../context/SurveyContext';
import TextInput from '../components/TextInput';
import InfoTooltip from '../components/InfoTooltip';
import { ArrowRight } from 'lucide-react';
import { useNavigationConfig } from '../context/NavigationContext';

export default function MunicipalName() {
  const { state, dispatch } = useSurvey();
  const navigate = useNavigate();

  const handleCorporate = () => {
    dispatch({ type: 'SET_FIELD', field: 'isMunicipal', value: false });
    navigate('/survey/corporate-name');
  };

  useNavigationConfig({
    currentStepId: 'municipal-name',
    canContinue: state.municipalName.trim().length > 0,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Municipality Name</h1>
        <p className="mt-1 text-base text-gray-600">
          Please provide the full name of the municipality initiating this filing.
        </p>
      </div>

      <TextInput
        label={<>Municipality Name <InfoTooltip /></>}
        required
        value={state.municipalName}
        onChange={v => dispatch({ type: 'SET_FIELD', field: 'municipalName', value: v })}
        placeholder="Enter municipality name"
      />

      <button
        onClick={handleCorporate}
        className="flex items-center gap-1 self-center text-base font-semibold text-accent hover:underline"
      >
        This is for a Corporate Entity <ArrowRight size={16} />
      </button>
    </div>
  );
}
