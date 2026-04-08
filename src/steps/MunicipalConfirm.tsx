import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../context/SurveyContext';
import { resolveWorkflow } from '../config/routingMatrix';
import { FileCheck } from 'lucide-react';
import { useNavigationConfig } from '../context/NavigationContext';

export default function MunicipalConfirm() {
  const navigate = useNavigate();
  const { state, dispatch } = useSurvey();

  const workflow = resolveWorkflow({
    corporateAction: 'None',
    securityType: 'Municipality',
    trading: state.municipalSecurityStatus === 'new' ? 'new' : 'existing',
  });

  useNavigationConfig({ currentStepId: 'municipal-confirm', canContinue: false });

  const handleConfirm = () => {
    dispatch({ type: 'MARK_COMPLETE', stepId: 'municipal-confirm' });
    navigate('/auth', { state: { workflow, source: 'survey' } });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Confirm Filing Type</h1>
        <p className="mt-1 text-base text-gray-600">
          Please confirm the filing details below.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Municipality</span>
          <span className="font-medium text-gray-900">{state.municipalName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Security Status</span>
          <span className="font-medium text-gray-900">
            {state.municipalSecurityStatus === 'new' ? 'New Security' : 'Existing Security'}
          </span>
        </div>
      </div>

      {workflow && (
        <div className="rounded-lg border border-accent/30 bg-accent-light p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent">
            <FileCheck size={16} /> Determined Filing Type
          </div>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {workflow.workflowId} — {workflow.filingType}
          </p>
        </div>
      )}

      <div className="mt-auto flex w-full items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Go Back
        </button>
        <button
          onClick={handleConfirm}
          className="h-11 rounded-lg bg-primary px-6 text-base font-semibold text-white shadow-sm hover:bg-primary-hover"
        >
          Confirm & Proceed
        </button>
      </div>
    </div>
  );
}
