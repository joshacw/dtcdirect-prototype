import type { SurveyState } from '../context/SurveyContext';

export interface StepNode {
  id: string;
  path: string;
  label: string;
  getNext: (state: SurveyState) => string | null;
  getPrev: (state: SurveyState) => string | null;
}

const TBD_ACTIONS = ['Chapter 11 Bankruptcy', 'Emergency'];
const SKIP_TO_PREFILING_ACTIONS = ['Stock Split', 'Dividend Distribution', 'Warrants', 'Name Change'];

export const stepGraph: Record<string, StepNode> = {
  'corporate-name': {
    id: 'corporate-name',
    path: '/survey/corporate-name',
    label: 'Corporate Name',
    getNext: () => 'jurisdiction',
    getPrev: () => null,
  },
  'jurisdiction': {
    id: 'jurisdiction',
    path: '/survey/jurisdiction',
    label: 'Jurisdiction',
    getNext: (state) => {
      if (state.entityType === 'us' || state.entityType === 'foreign') {
        return 'security-type';
      }
      return null; // ineligible
    },
    getPrev: () => 'corporate-name',
  },
  'security-type': {
    id: 'security-type',
    path: '/survey/security-type',
    label: 'Security Type',
    getNext: () => 'industry-check',
    getPrev: () => 'jurisdiction',
  },
  'industry-check': {
    id: 'industry-check',
    path: '/survey/industry-check',
    label: 'Industry Classification',
    getNext: () => 'corporate-action',
    getPrev: () => 'security-type',
  },
  'corporate-action': {
    id: 'corporate-action',
    path: '/survey/corporate-action',
    label: 'Corporate Action',
    getNext: (state) => {
      if (TBD_ACTIONS.includes(state.corporateAction)) return 'tbd';
      if (SKIP_TO_PREFILING_ACTIONS.includes(state.corporateAction)) return 'pre-filing';
      return 'trading-check'; // "None of the above"
    },
    getPrev: () => 'industry-check',
  },
  'tbd': {
    id: 'tbd',
    path: '/survey/tbd',
    label: 'Coming Soon',
    getNext: () => null,
    getPrev: () => 'corporate-action',
  },
  'trading-check': {
    id: 'trading-check',
    path: '/survey/trading-check',
    label: 'Trading Check',
    getNext: () => 'pre-filing',
    getPrev: () => 'corporate-action',
  },
  'pre-filing': {
    id: 'pre-filing',
    path: '/survey/pre-filing',
    label: 'Pre-Filing',
    getNext: () => 'review',
    getPrev: (state) => {
      if (SKIP_TO_PREFILING_ACTIONS.includes(state.corporateAction)) return 'corporate-action';
      return 'trading-check';
    },
  },
  'review': {
    id: 'review',
    path: '/survey/review',
    label: 'Review & Confirm',
    getNext: () => null,
    getPrev: () => 'pre-filing',
  },
  // Municipality branch
  'municipal-name': {
    id: 'municipal-name',
    path: '/survey/municipal-name',
    label: 'Municipality Name',
    getNext: () => 'municipal-security-type',
    getPrev: () => 'corporate-name',
  },
  'municipal-security-type': {
    id: 'municipal-security-type',
    path: '/survey/municipal-security-type',
    label: 'Security Status',
    getNext: () => 'municipal-confirm',
    getPrev: () => 'municipal-name',
  },
  'municipal-confirm': {
    id: 'municipal-confirm',
    path: '/survey/municipal-confirm',
    label: 'Confirm Filing',
    getNext: () => null,
    getPrev: () => 'municipal-security-type',
  },
};

// Steps for progress bar computation per path
export const mainPathSteps = [
  'corporate-name', 'jurisdiction', 'security-type', 'industry-check',
  'corporate-action', 'trading-check', 'pre-filing', 'review'
];

export const municipalPathSteps = [
  'corporate-name', 'municipal-name', 'municipal-security-type', 'municipal-confirm'
];

export function getActivePathSteps(state: SurveyState): string[] {
  if (state.isMunicipal) return municipalPathSteps;

  const steps = ['corporate-name', 'jurisdiction', 'security-type', 'industry-check', 'corporate-action'];

  if (SKIP_TO_PREFILING_ACTIONS.includes(state.corporateAction)) {
    steps.push('pre-filing', 'review');
  } else if (TBD_ACTIONS.includes(state.corporateAction)) {
    steps.push('tbd');
  } else {
    steps.push('trading-check', 'pre-filing', 'review');
  }

  return steps;
}
