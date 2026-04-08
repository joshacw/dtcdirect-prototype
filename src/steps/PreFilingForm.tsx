import { useSurvey } from '../context/SurveyContext';
import { offeringDocumentTypes, cusipTypes } from '../config/securityTypes';
import SearchableDropdown from '../components/SearchableDropdown';
import TextInput from '../components/TextInput';
import YesNoToggle from '../components/YesNoToggle';
import { useNavigationConfig } from '../context/NavigationContext';

export default function PreFilingForm() {
  const { state, dispatch } = useSurvey();
  const pf = state.preFilingData;
  const secType = state.securityType || 'security';
  const name = state.corporateName || 'your company';

  const set = (field: string, value: unknown) =>
    dispatch({ type: 'SET_PRE_FILING', field: field as any, value });

  const canContinue =
    !!pf.offeringDocType &&
    pf.hasClosingDate !== null &&
    (pf.hasClosingDate === false || !!pf.closingDate) &&
    pf.hasCusip !== null &&
    (pf.hasCusip === false || (!!pf.cusipType && pf.cusipNumber.length === 9));

  useNavigationConfig({
    currentStepId: 'pre-filing',
    canContinue,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Tell us more about this {secType.toLowerCase()} for {name}.
        </h1>
      </div>

      <SearchableDropdown
        label="Offering Document Type"
        required
        value={pf.offeringDocType}
        onChange={v => set('offeringDocType', v)}
        options={offeringDocumentTypes}
        placeholder="Select document type"
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Do you know the settlement / closing date? <span className="text-danger">*</span>
        </label>
        <YesNoToggle
          value={pf.hasClosingDate}
          onChange={v => set('hasClosingDate', v)}
        />
        {pf.hasClosingDate === true && (
          <input
            type="date"
            value={pf.closingDate}
            onChange={e => set('closingDate', e.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-input-border bg-white px-3 text-base text-gray-900 shadow-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Do you have a CUSIP for this {secType.toLowerCase()}? <span className="text-danger">*</span>
        </label>
        <YesNoToggle
          value={pf.hasCusip}
          onChange={v => set('hasCusip', v)}
        />
        {pf.hasCusip === true && (
          <div className="mt-2 flex flex-col gap-3">
            <SearchableDropdown
              label="What type of CUSIP number is this?"
              required
              value={pf.cusipType}
              onChange={v => set('cusipType', v)}
              options={cusipTypes}
              placeholder="Select CUSIP type"
            />
            <TextInput
              label="CUSIP Number"
              required
              value={pf.cusipNumber}
              onChange={v => set('cusipNumber', v.replace(/[^a-zA-Z0-9]/g, '').slice(0, 9))}
              placeholder="Enter 9-character CUSIP"
            />
            {pf.cusipNumber.length > 0 && pf.cusipNumber.length !== 9 && (
              <p className="text-xs text-danger">CUSIP must be exactly 9 alphanumeric characters.</p>
            )}
          </div>
        )}
        {pf.hasCusip === false && (
          <p className="mt-1 text-sm text-gray-500">
            System will apply for CUSIP on behalf of issuer.
          </p>
        )}
      </div>

    </div>
  );
}
