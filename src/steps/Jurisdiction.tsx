import { useSurvey } from '../context/SurveyContext';
import { dtcEligibleCountries } from '../config/countries';
import SearchableDropdown from '../components/SearchableDropdown';
import { useNavigationConfig } from '../context/NavigationContext';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming','District of Columbia',
];

export default function Jurisdiction() {
  const { state, dispatch } = useSurvey();
  const name = state.corporateName || 'your company';

  const handleCountryChange = (country: string) => {
    dispatch({ type: 'SET_FIELD', field: 'country', value: country });
    dispatch({
      type: 'SET_FIELD',
      field: 'entityType',
      value: country === 'United States' ? 'us' : 'foreign',
    });
    if (country !== 'United States') {
      dispatch({ type: 'SET_FIELD', field: 'usState', value: '' });
    }
  };

  const isEligible = !state.country || dtcEligibleCountries.includes(state.country);
  const isUS = state.country === 'United States';

  useNavigationConfig({
    currentStepId: 'jurisdiction',
    canContinue: !!state.country && isEligible && (!isUS || !!state.usState),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Where is {name} domiciled?
        </h1>
        <p className="mt-1 text-base text-gray-600">
          Choose the country where {name} is legally registered and operates.
        </p>
      </div>

      <SearchableDropdown
        label="Country of Origin"
        required
        value={state.country}
        onChange={handleCountryChange}
        options={dtcEligibleCountries}
        placeholder="Select a country"
      />

      {isUS && (
        <SearchableDropdown
          label="Which State?"
          required
          value={state.usState}
          onChange={v => dispatch({ type: 'SET_FIELD', field: 'usState', value: v })}
          options={US_STATES}
          placeholder="Select a state"
        />
      )}

      {!isEligible && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">
          This country is not eligible for DTC services. Please contact support for assistance.
        </div>
      )}

    </div>
  );
}
