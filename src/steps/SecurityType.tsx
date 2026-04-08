import { useSurvey } from '../context/SurveyContext';
import { usSecurityTypes, foreignSecurityTypes } from '../config/securityTypes';
import SearchableDropdown from '../components/SearchableDropdown';
import TBDPlaceholder from '../components/TBDPlaceholder';
import { useNavigationConfig } from '../context/NavigationContext';
import { useState } from 'react';

export default function SecurityType() {
  const { state, dispatch } = useSurvey();
  const [showTBD, setShowTBD] = useState(false);

  const isUS = state.entityType === 'us';
  const options = isUS ? usSecurityTypes : foreignSecurityTypes;
  const dropdownLabel = isUS ? 'Security Type' : 'Common Ordinary Share Type';

  const handleChange = (value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'securityType', value });
    if (value === 'Warrants' || value === 'Warrants (requires warrant agreement)') {
      setShowTBD(true);
    } else {
      setShowTBD(false);
    }
  };

  useNavigationConfig({
    currentStepId: 'security-type',
    canContinue: !!state.securityType && state.securityType !== 'Warrants' && state.securityType !== 'Warrants (requires warrant agreement)',
  });

  if (showTBD) {
    return (
      <div className="flex flex-col gap-6">
        <TBDPlaceholder title="Warrants Filing — Coming Soon" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Select Security Type</h1>
        <p className="mt-1 text-base text-gray-600">
          Choose the type of security associated with this filing to ensure accurate processing.
        </p>
      </div>

      <SearchableDropdown
        label={dropdownLabel}
        required
        value={state.securityType}
        onChange={handleChange}
        options={options}
        placeholder="Select security type"
      />
    </div>
  );
}
