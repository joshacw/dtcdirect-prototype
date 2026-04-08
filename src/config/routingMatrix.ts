export interface RoutingEntry {
  corporateAction?: string;
  securityType?: string;
  trading?: 'new' | 'existing';
  workflowId: string;
  filingType: string;
}

export const routingMatrix: RoutingEntry[] = [
  // Equity paths
  { corporateAction: 'None', securityType: 'Equity', trading: 'new', workflowId: 'WF-NI-CE', filingType: 'NEW2 — New Issue Corporate Equity' },
  { corporateAction: 'None', securityType: 'Equity', trading: 'existing', workflowId: 'WF-OI-CE', filingType: 'OLD1 — Older Issue Corporate Equity' },
  // Debt paths
  { corporateAction: 'None', securityType: 'Debt', trading: 'new', workflowId: 'WF-NI-CD', filingType: 'NEW1 — New Issue Corporate Debt' },
  { corporateAction: 'None', securityType: 'Debt', trading: 'existing', workflowId: 'WF-OI-CE', filingType: 'OLD1 — Corporate Debt Older Issue' },
  // Municipal paths
  { corporateAction: 'None', securityType: 'Municipality', trading: 'new', workflowId: 'WF-NI-MD', filingType: 'NEW3 — New Issue Municipal' },
  { corporateAction: 'None', securityType: 'Municipality', trading: 'existing', workflowId: 'WF-OI-M', filingType: 'OLD2 — Municipal Older Issue' },
  // Corporate action paths (trading check skipped)
  { corporateAction: 'Stock Split', workflowId: 'WF-CA-SD', filingType: 'CORP5 — Stock Distribution' },
  { corporateAction: 'Dividend Distribution', workflowId: 'WF-CA-SD', filingType: 'CORP5 — Stock Distribution' },
  { corporateAction: 'Warrants', workflowId: 'WF-CA-RW', filingType: 'CORP4 — Rights / Warrants' },
  { corporateAction: 'Name Change', workflowId: 'WF-CA-NC', filingType: 'CORP3 — DTC Name Change' },
  { corporateAction: 'Stock Exchanges', workflowId: 'WF-CA-SE', filingType: 'CORP2 — Stock Exchange' },
  { corporateAction: 'Mandatory Actions', workflowId: 'WF-CA-ME', filingType: 'CORP1 — Mandatory Exchange' },
  { corporateAction: 'Chapter 11 Bankruptcy', workflowId: 'TBD', filingType: 'TBD — Pending confirmation' },
  { corporateAction: 'Emergency', workflowId: 'TBD', filingType: 'TBD — Pending confirmation' },
];

export interface ResolvedWorkflow {
  workflowId: string;
  filingType: string;
}

export function resolveWorkflow(params: {
  corporateAction: string;
  securityType: string;
  trading: 'new' | 'existing' | null;
}): ResolvedWorkflow | null {
  const { corporateAction, securityType, trading } = params;

  // First check corporate action paths (they don't need securityType/trading)
  if (corporateAction && corporateAction !== 'None') {
    const match = routingMatrix.find(e => e.corporateAction === corporateAction && !e.securityType);
    if (match) return { workflowId: match.workflowId, filingType: match.filingType };
  }

  // Then check by securityType + trading
  if (securityType && trading) {
    const match = routingMatrix.find(
      e => e.corporateAction === 'None' && e.securityType === securityType && e.trading === trading
    );
    if (match) return { workflowId: match.workflowId, filingType: match.filingType };
  }

  return null;
}
