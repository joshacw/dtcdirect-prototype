import { useSurvey } from '../context/SurveyContext';
import RadioGrid from '../components/RadioGrid';
import { useNavigationConfig } from '../context/NavigationContext';

export default function MunicipalSecurityType() {
  const { state, dispatch } = useSurvey();

  const value = state.municipalSecurityStatus === 'new'
    ? 'New Security'
    : state.municipalSecurityStatus === 'existing'
    ? 'Existing Security'
    : '';

  const handleChange = (v: string) => {
    dispatch({
      type: 'SET_FIELD',
      field: 'municipalSecurityStatus',
      value: v === 'New Security' ? 'new' : 'existing',
    });
  };

  useNavigationConfig({
    currentStepId: 'municipal-security-type',
    canContinue: state.municipalSecurityStatus !== null,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Security Status</h1>
        <p className="mt-1 text-base text-gray-600">
          Is this a new security or an existing one?
        </p>
      </div>

      <RadioGrid
        options={['New Security', 'Existing Security']}
        value={value}
        onChange={handleChange}
        columns={2}
      />
    </div>
  );
}
