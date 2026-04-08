import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';

export interface PreFilingData {
  offeringDocType: string;
  hasClosingDate: boolean | null;
  closingDate: string;
  hasCusip: boolean | null;
  cusipType: string;
  cusipNumber: string;
}

export interface SurveyState {
  corporateName: string;
  isMunicipal: boolean;
  municipalName: string;
  municipalSecurityStatus: 'new' | 'existing' | null;
  country: string;
  usState: string;
  entityType: 'us' | 'foreign' | null;
  securityType: string;
  industries: string[];
  corporateAction: string;
  tradesOnExchange: boolean | null;
  preFilingData: PreFilingData;
  returnToReview: boolean;
  editOriginStep: string | null;
  completedSteps: string[];
}

const initialState: SurveyState = {
  corporateName: '',
  isMunicipal: false,
  municipalName: '',
  municipalSecurityStatus: null,
  country: '',
  usState: '',
  entityType: null,
  securityType: '',
  industries: [],
  corporateAction: '',
  tradesOnExchange: null,
  preFilingData: {
    offeringDocType: '',
    hasClosingDate: null,
    closingDate: '',
    hasCusip: null,
    cusipType: '',
    cusipNumber: '',
  },
  returnToReview: false,
  editOriginStep: null,
  completedSteps: [],
};

type SurveyAction =
  | { type: 'SET_FIELD'; field: keyof SurveyState; value: unknown }
  | { type: 'SET_PRE_FILING'; field: keyof PreFilingData; value: unknown }
  | { type: 'MARK_COMPLETE'; stepId: string }
  | { type: 'SET_RETURN_TO_REVIEW'; editOriginStep: string | null }
  | { type: 'LOAD_SAVED'; state: SurveyState }
  | { type: 'RESET' };

function surveyReducer(state: SurveyState, action: SurveyAction): SurveyState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_PRE_FILING':
      return { ...state, preFilingData: { ...state.preFilingData, [action.field]: action.value } };
    case 'MARK_COMPLETE':
      if (state.completedSteps.includes(action.stepId)) return state;
      return { ...state, completedSteps: [...state.completedSteps, action.stepId] };
    case 'SET_RETURN_TO_REVIEW':
      return { ...state, returnToReview: action.editOriginStep !== null, editOriginStep: action.editOriginStep };
    case 'LOAD_SAVED':
      return action.state;
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const STORAGE_KEY = 'dtc-survey-progress';

function loadSavedState(): SurveyState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

interface SurveyContextValue {
  state: SurveyState;
  dispatch: Dispatch<SurveyAction>;
}

const SurveyContext = createContext<SurveyContextValue | null>(null);

export function SurveyProvider({ children }: { children: ReactNode }) {
  const saved = loadSavedState();
  const [state, dispatch] = useReducer(surveyReducer, saved ?? initialState);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 300);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <SurveyContext.Provider value={{ state, dispatch }}>
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error('useSurvey must be used within SurveyProvider');
  return ctx;
}

export function clearSurveyStorage() {
  localStorage.removeItem(STORAGE_KEY);
}
