import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../context/SurveyContext';
import TextInput from '../components/TextInput';
import { ArrowRight } from 'lucide-react';
import InfoTooltip from '../components/InfoTooltip';
import { useNavigationConfig } from '../context/NavigationContext';

export default function CorporateName() {
  const { state, dispatch } = useSurvey();
  const navigate = useNavigate();

  const handleMunicipality = () => {
    dispatch({ type: 'SET_FIELD', field: 'isMunicipal', value: true });
    navigate('/survey/municipal-name');
  };

  useNavigationConfig({
    currentStepId: 'corporate-name',
    canContinue: state.corporateName.trim().length > 0,
    onContinue: () => dispatch({ type: 'SET_FIELD', field: 'isMunicipal', value: false }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Corporate Name</h1>
        <p className="mt-1 text-base text-gray-600">
          Please provide your full corporate name for the company.
        </p>
      </div>

      <TextInput
        label={<>Corporate Name <InfoTooltip /></>}
        required
        value={state.corporateName}
        onChange={v => dispatch({ type: 'SET_FIELD', field: 'corporateName', value: v })}
        placeholder="Enter corporate name"
      />

      <button
        onClick={handleMunicipality}
        className="flex items-center gap-1 self-center text-base font-semibold text-accent hover:underline"
      >
        This is for a Municipality <ArrowRight size={16} />
      </button>
    </div>
  );
}
