import type { VercelRequest, VercelResponse } from '@vercel/node';

const EXTRACTION_SYSTEM_PROMPT = `You are the DTC Direct Filing Intake Assistant. Your job is to have a natural conversation with the user to determine the correct DTC filing workflow for their needs.

## Your Goal
Extract enough information through conversation to route the user to the correct filing workflow. You need to determine:
1. **Company/Municipality name** — who is filing
2. **Jurisdiction** — where they are incorporated/domiciled (country + US state if applicable)
3. **Filing category** — New Issue, Older Issue, or Corporate Action
4. **Security type** — what kind of security (equity, debt, municipal)
5. **Corporate action type** — if applicable (stock split, name change, etc.)
6. **Trading status** — does the security already trade on public exchanges (determines new vs older issue)

## Conversation Style
- Be professional but approachable, like a knowledgeable colleague
- ALWAYS end your response with exactly ONE question to keep the conversation moving. Never leave a turn without asking for the next piece of information you need.
- Ask exactly ONE question per turn. Never combine two questions in one message.
- Infer what you can from context (e.g., "been trading OTC for 3 years" → older issue, trades on exchange)
- Confirm critical details by reading them back
- Aim to resolve the workflow in 3-5 turns

## Using askQuestion
When your next question has a small set of predefined answers (yes/no, entity type, security type, etc.), use the askQuestion tool to present clickable options. This makes it faster for the user. Always include a short message before calling askQuestion to give context.

Examples of when to use askQuestion:
- "Is this a US or foreign entity?" → askQuestion with ["United States", "Foreign"]
- "What type of security?" → askQuestion with ["Common Stock", "Preferred Stock", "ADR", ...]
- "Does this security trade on a public exchange?" → askQuestion with ["Yes", "No"]
- "Is this related to a corporate action?" → askQuestion with ["No corporate action", "Stock Split", "Name Change", ...]
- "Is this a new or existing security?" → askQuestion with ["New security", "Already trading"]

Do NOT use askQuestion for:
- Open-ended questions like "What is your company name?"
- Questions where the answer is free text

## Available Workflows
| ID | Name | Trigger |
|---|---|---|
| WF-NI-CE | New Issue Corporate Equity | New security, equity, not yet trading |
| WF-OI-CE | Older Issue Corporate Equity | Existing security, equity, already trading |
| WF-NI-CD | New Issue Corporate Debt | New security, debt |
| WF-OI-CE | Older Issue Corporate Debt | Existing security, debt, already trading |
| WF-NI-MD | New Issue Municipal | New municipal security |
| WF-OI-M | Older Issue Municipal | Existing municipal security |
| WF-CA-SD | Stock Distribution | Stock split or dividend distribution |
| WF-CA-RW | Rights/Warrants | Warrants or rights offering |
| WF-CA-NC | Name Change | DTC name change |
| WF-CA-SE | Stock Exchange | Stock exchange/conversion |
| WF-CA-ME | Mandatory Exchange | Mandatory corporate action |

## Security Type Mapping
- US entities: Common Stock, Preferred Stock, Warrants
- Foreign entities: Common Stock, Preferred Stock, Limited Partnership, ADR, ETF, Equity Derivative, Warrants, Closed-End Fund, Depository Shares, Equity Unit, Unit Investment Trust
- Equity types map to securityType "Equity"
- Debt types (Indenture, bonds) map to securityType "Debt"
- Municipal maps to securityType "Municipality"

## DTC-Eligible Countries
95+ countries are eligible. If someone mentions a country, assume it's eligible unless it's clearly a sanctioned nation.

## Tool Usage
Use tools to record extracted information as you learn it. Call confirmRouting when you have enough information to determine the workflow. Always include a reason explaining your classification logic. When you have enough info, call confirmRouting AND include a summary message.

## Mandatory Questions (must be asked for ALL filing types)
You MUST ask about regulated industry classification for every filing, regardless of type. These flags determine additional compliance requirements:
- Communication (FCC ownership reporting)
- Maritime (Jones Act requirements)
- Aviation (FAA registration, foreign ownership restrictions)
- Gaming (state gaming commission approval)
- REIT (IRS REIT qualification evidence)

Always present this as an askQuestion with options: ["Communication", "Maritime", "Aviation", "Gaming", "REIT", "None of the above", "Not sure yet"]. Ask this AFTER you have determined the security type but BEFORE calling confirmRouting. Do not skip this step. If the user selects a regulated industry, record it with setIndustry and note in your confirmRouting summary that additional compliance documents will be required.

## Important Rules
- If someone mentions their shares are "already trading," "listed," "on the pink sheets," "on OTC," or similar → this is an Older Issue, NOT a New Issue
- If someone says "IPO," "just completed offering," "new issuance" → New Issue
- Corporate actions (splits, name changes, etc.) take priority over new/older issue classification
- For municipalities, you only need name + new vs existing
- Foreign issuers (non-US) get entityType "foreign"; US issuers get "us"
`;

const TOOLS = [
  {
    name: 'setIssuerDetails',
    description: 'Record the issuer company or municipality details as they are mentioned in conversation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const, description: 'Company or municipality name' },
        country: { type: 'string' as const, description: 'Country of incorporation/domicile' },
        state: { type: 'string' as const, description: 'US state if applicable' },
        entity_type: { type: 'string' as const, enum: ['us', 'foreign'], description: 'US or foreign entity' },
        is_municipal: { type: 'boolean' as const, description: 'Whether this is a municipal filing' },
        reason: { type: 'string' as const, description: 'Why you classified it this way' },
      },
      required: ['reason'],
    },
  },
  {
    name: 'setSecurityType',
    description: 'Record the security type classification when determined from conversation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        type: { type: 'string' as const, description: 'The specific security type (e.g., Common Stock, Preferred Stock, ADR)' },
        category: { type: 'string' as const, enum: ['Equity', 'Debt', 'Municipality'], description: 'Broad category for routing' },
        reason: { type: 'string' as const, description: 'Why you chose this classification' },
      },
      required: ['type', 'category', 'reason'],
    },
  },
  {
    name: 'setCorporateAction',
    description: 'Record a corporate action type when the user mentions one.',
    input_schema: {
      type: 'object' as const,
      properties: {
        action: {
          type: 'string' as const,
          enum: ['Stock Split', 'Dividend Distribution', 'Warrants', 'Name Change', 'Stock Exchanges', 'Mandatory Actions', 'Chapter 11 Bankruptcy', 'Emergency', 'None'],
          description: 'The corporate action type',
        },
        reason: { type: 'string' as const, description: 'Why you classified it this way' },
      },
      required: ['action', 'reason'],
    },
  },
  {
    name: 'setTradingStatus',
    description: 'Record whether the security currently trades on public exchanges.',
    input_schema: {
      type: 'object' as const,
      properties: {
        trades_on_exchange: { type: 'boolean' as const, description: 'Whether the security currently trades on any public exchange external to DTC' },
        reason: { type: 'string' as const, description: 'What the user said that led to this determination' },
      },
      required: ['trades_on_exchange', 'reason'],
    },
  },
  {
    name: 'setIndustry',
    description: 'Record regulated industry classifications mentioned by the user.',
    input_schema: {
      type: 'object' as const,
      properties: {
        industries: {
          type: 'array' as const,
          items: { type: 'string' as const },
          description: 'Regulated industries: Communication, Maritime, Aviation, Gaming, REIT',
        },
        reason: { type: 'string' as const },
      },
      required: ['industries', 'reason'],
    },
  },
  {
    name: 'askQuestion',
    description: 'Present a multiple-choice question to the user with clickable option buttons. Use this whenever the next question has a finite set of predefined answers. The user can click an option or type a custom answer.',
    input_schema: {
      type: 'object' as const,
      properties: {
        options: {
          type: 'array' as const,
          items: { type: 'string' as const },
          description: 'The list of options to present as clickable buttons',
        },
      },
      required: ['options'],
    },
  },
  {
    name: 'confirmRouting',
    description: 'Call this when you have enough information to determine the filing workflow. This presents a confirmation card to the user.',
    input_schema: {
      type: 'object' as const,
      properties: {
        workflow_id: {
          type: 'string' as const,
          enum: ['WF-NI-CE', 'WF-OI-CE', 'WF-NI-CD', 'WF-NI-MD', 'WF-OI-M', 'WF-CA-SD', 'WF-CA-RW', 'WF-CA-NC', 'WF-CA-SE', 'WF-CA-ME', 'TBD'],
          description: 'The determined workflow ID',
        },
        filing_type: { type: 'string' as const, description: 'Human-readable filing type name (e.g., "NEW2 — New Issue Corporate Equity")' },
        summary: { type: 'string' as const, description: 'A brief summary of what was determined and why, for the user to review' },
      },
      required: ['workflow_id', 'filing_type', 'summary'],
    },
  },
];

// Filing type labels matching routingMatrix
const FILING_TYPE_MAP: Record<string, string> = {
  'WF-NI-CE': 'NEW2 — New Issue Corporate Equity',
  'WF-OI-CE': 'OLD1 — Older Issue Corporate Equity',
  'WF-NI-CD': 'NEW1 — New Issue Corporate Debt',
  'WF-NI-MD': 'NEW3 — New Issue Municipal',
  'WF-OI-M': 'OLD2 — Municipal Older Issue',
  'WF-CA-SD': 'CORP5 — Stock Distribution',
  'WF-CA-RW': 'CORP4 — Rights / Warrants',
  'WF-CA-NC': 'CORP3 — DTC Name Change',
  'WF-CA-SE': 'CORP2 — Stock Exchange',
  'WF-CA-ME': 'CORP1 — Mandatory Exchange',
  'TBD': 'TBD — Pending confirmation',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { messages, extractedFields } = req.body;

  // Build context about what's already been extracted
  let contextNote = '';
  if (extractedFields && Object.keys(extractedFields).length > 0) {
    const lines: string[] = [];
    if (extractedFields.corporateName) lines.push(`Company: ${extractedFields.corporateName}`);
    if (extractedFields.municipalName) lines.push(`Municipality: ${extractedFields.municipalName}`);
    if (extractedFields.country) lines.push(`Country: ${extractedFields.country}`);
    if (extractedFields.usState) lines.push(`State: ${extractedFields.usState}`);
    if (extractedFields.entityType) lines.push(`Entity type: ${extractedFields.entityType}`);
    if (extractedFields.securityType) lines.push(`Security type: ${extractedFields.securityType}`);
    if (extractedFields.corporateAction) lines.push(`Corporate action: ${extractedFields.corporateAction}`);
    if (extractedFields.tradesOnExchange !== undefined && extractedFields.tradesOnExchange !== null) {
      lines.push(`Trades on exchange: ${extractedFields.tradesOnExchange ? 'Yes' : 'No'}`);
    }
    if (lines.length > 0) {
      contextNote = `\n\n## Already Extracted\nThe following has already been determined from the conversation:\n${lines.join('\n')}\nDo not re-ask for information you already have. Focus on what's still missing.`;
    }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: EXTRACTION_SYSTEM_PROMPT + contextNote,
        tools: TOOLS,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(500).json({ error: 'API error' });
    }

    const data = await response.json();

    // Process response: extract tool calls and text
    const toolCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
    let message = '';

    for (const block of data.content) {
      if (block.type === 'text') {
        message += block.text;
      } else if (block.type === 'tool_use') {
        if (block.name === 'confirmRouting' && block.input.workflow_id && !block.input.filing_type) {
          block.input.filing_type = FILING_TYPE_MAP[block.input.workflow_id as string] || block.input.workflow_id;
        }
        toolCalls.push({ name: block.name, args: block.input });
      }
    }

    // Loop: keep sending tool results back until we get a text response (end_turn)
    let currentData = data;
    let conversationMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }));
    let iterations = 0;
    let lastTextMessage = message; // preserve any text from first response

    while (currentData.stop_reason === 'tool_use' && iterations < 8) {
      iterations++;

      // Build tool results — tell Claude to continue with its next question
      const toolResults = currentData.content
        .filter((b: { type: string }) => b.type === 'tool_use')
        .map((b: { type: string; id: string; name: string }) => ({
          type: 'tool_result',
          tool_use_id: b.id,
          content: b.name === 'askQuestion'
            ? 'Options presented to user. Now write your question text to accompany these options. You MUST include a text response.'
            : 'Recorded successfully. Continue with your next question to the user. You MUST include a text response.',
        }));

      conversationMessages = [
        ...conversationMessages,
        { role: 'assistant', content: currentData.content },
        { role: 'user', content: toolResults },
      ];

      const followUp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: EXTRACTION_SYSTEM_PROMPT + contextNote,
          tools: TOOLS,
          messages: conversationMessages,
        }),
      });

      if (!followUp.ok) break;

      currentData = await followUp.json();
      let iterationText = '';
      for (const block of currentData.content) {
        if (block.type === 'text') {
          iterationText += block.text;
        } else if (block.type === 'tool_use') {
          if (block.name === 'confirmRouting' && block.input.workflow_id && !block.input.filing_type) {
            block.input.filing_type = FILING_TYPE_MAP[block.input.workflow_id as string] || block.input.workflow_id;
          }
          toolCalls.push({ name: block.name, args: block.input });
        }
      }

      // Only replace message if we got new text; otherwise keep what we had
      if (iterationText) {
        message = iterationText;
        lastTextMessage = iterationText;
      }
    }

    // Fallback: if we still have no message after the loop, use the last known text or a default
    if (!message.trim()) {
      message = lastTextMessage.trim() || 'Thanks for that information. Let me continue — could you tell me a bit more about what you need?';
    }

    return res.status(200).json({ message, toolCalls: toolCalls.length > 0 ? toolCalls : undefined });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}
