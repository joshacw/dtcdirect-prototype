import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../context/SurveyContext';
import { resolveWorkflow } from '../config/routingMatrix';

const CATEGORIES = [
  { value: 'new-issue', label: 'New Issue' },
  { value: 'older-issue', label: 'Older Issue' },
  { value: 'corporate-action', label: 'Corporate Action' },
];

const SUB_TYPES: Record<string, Array<{ value: string; label: string; action?: string; security?: string; trading?: 'new' | 'existing' }>> = {
  'new-issue': [
    { value: 'ni-ce', label: 'Corporate Equity', security: 'Equity', trading: 'new' },
    { value: 'ni-cd', label: 'Corporate Debt', security: 'Debt', trading: 'new' },
    { value: 'ni-md', label: 'Municipal', security: 'Municipality', trading: 'new' },
  ],
  'older-issue': [
    { value: 'oi-ce', label: 'Corporate Equity', security: 'Equity', trading: 'existing' },
    { value: 'oi-cd', label: 'Corporate Debt', security: 'Debt', trading: 'existing' },
    { value: 'oi-m', label: 'Municipal', security: 'Municipality', trading: 'existing' },
  ],
  'corporate-action': [
    { value: 'ca-sd-split', label: 'Stock Split', action: 'Stock Split' },
    { value: 'ca-sd-div', label: 'Dividend Distribution', action: 'Dividend Distribution' },
    { value: 'ca-rw', label: 'Rights / Warrants', action: 'Warrants' },
    { value: 'ca-nc', label: 'Name Change', action: 'Name Change' },
    { value: 'ca-se', label: 'Stock Exchange', action: 'Stock Exchanges' },
    { value: 'ca-me', label: 'Mandatory Exchange', action: 'Mandatory Actions' },
  ],
};

export default function DirectSelect() {
  const navigate = useNavigate();
  const { dispatch } = useSurvey();
  const [category, setCategory] = useState('');
  const [subType, setSubType] = useState('');

  const subTypes = category ? SUB_TYPES[category] || [] : [];
  const selected = subTypes.find(s => s.value === subType);

  const handleContinue = () => {
    if (!selected) return;

    const workflow = resolveWorkflow({
      corporateAction: selected.action || 'None',
      securityType: selected.security || '',
      trading: selected.trading || null,
    });

    if (!workflow) return;

    // Set minimal context in SurveyContext
    if (selected.security) {
      dispatch({ type: 'SET_FIELD', field: 'securityType', value: selected.security === 'Equity' ? 'Common Stock' : selected.security });
    }
    if (selected.action) {
      dispatch({ type: 'SET_FIELD', field: 'corporateAction', value: selected.action });
    }
    if (selected.trading) {
      dispatch({ type: 'SET_FIELD', field: 'tradesOnExchange', value: selected.trading === 'existing' });
    }

    navigate('/auth', {
      state: {
        workflow,
        source: 'direct',
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Top: wordmark */}
      <div className="flex justify-center px-8 pt-8">
        <div className="flex items-baseline gap-1 text-xl font-bold">
          <span className="text-accent">DTC</span>
          <span className="text-gray-900">Direct</span>
        </div>
      </div>

      {/* Center */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-[440px] flex-col">
          <h1 className="text-center text-2xl font-semibold text-gray-900">Select Your Filing Type</h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            Choose the category and type that matches your filing
          </p>

          {/* Category */}
          <div className="mt-8">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Filing Category</label>
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setSubType(''); }}
              className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Sub-type */}
          {category && (
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Filing Type</label>
              <select
                value={subType}
                onChange={e => setSubType(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              >
                <option value="">Select a type…</option>
                {subTypes.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Resolved workflow preview */}
          {selected && (
            <div className="mt-4 rounded-lg border border-accent/20 bg-accent-light px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-wider text-accent">Workflow</div>
              <div className="mt-0.5 text-sm font-medium text-gray-900">
                {resolveWorkflow({
                  corporateAction: selected.action || 'None',
                  securityType: selected.security || '',
                  trading: selected.trading || null,
                })?.filingType}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={!selected}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: help */}
      <div className="flex justify-center px-8 pb-8">
        <span className="text-sm text-gray-500">
          Not sure? <button onClick={() => navigate('/')} className="font-semibold text-accent hover:underline">Let us help you find the right one</button>
        </span>
      </div>
    </div>
  );
}
