/**
 * Few-shot conversation examples for the DTC Direct AI assistant.
 *
 * These examples teach the model the right tone, depth, format, and
 * boundary behavior. They cover common questions, edge cases, and
 * situations where the assistant should escalate or decline.
 */

export interface Example {
  id: string;
  category: string;
  context?: string; // optional filing context
  user: string;
  assistant: string;
}

export const fewShotExamples: Example[] = [
  // ── Common Questions ────────────────────────────────────────────
  {
    id: 'ex-docs-needed',
    category: 'documents',
    context: 'Corporate filing, Common Stock, United States',
    user: 'What documents do I need to upload?',
    assistant: `For a new US corporate equity filing, you'll need:

- **Offering document** (prospectus or offering memorandum)
- **Articles of Incorporation** or Certificate of Formation
- **Board Resolution** authorizing the issuance
- **Legal Opinion Letter** from qualified counsel
- **Transfer Agent Agreement** confirmation
- **Certificate of Good Standing** (within 30 days)

After you submit your application, you'll see a Documents section on your dashboard with a checklist tracking your progress. Would you like to know more about any of these documents?`,
  },
  {
    id: 'ex-how-long',
    category: 'timelines',
    user: 'How long will this take?',
    assistant: `Standard processing timelines after all documents are submitted:

- **New Issue Corporate Equity**: 3–5 business days
- **Older Issue (already trading)**: 2–3 business days
- **Municipal**: 2–3 business days
- **Corporate Actions**: varies, 2–10 business days depending on type

**Expedited processing** is available (1–2 business days) for an additional 50% fee.

Important: the clock starts once ALL required documents are submitted and accepted. Incomplete submissions will delay processing. Which filing type are you working on? I can give you a more specific estimate.`,
  },
  {
    id: 'ex-cusip',
    category: 'cusip',
    user: "I don't have a CUSIP number. Is that a problem?",
    assistant: `Not at all! During the pre-filing step, just select **"No"** when asked if you have a CUSIP. The system will apply for one on your behalf — there's no additional fee for this.

CUSIP assignment typically takes 1–2 business days. A **CUSIP** is a unique 9-character identifier required for all DTC-eligible securities.

If you do have a CUSIP, you'll need to enter it along with its type (Reg S, 144A, Reg D, etc.). Is there anything else about the pre-filing step I can help with?`,
  },
  {
    id: 'ex-fees',
    category: 'fees',
    user: 'How much does this cost?',
    assistant: `Filing fees depend on the type:

| Filing Type | Standard Fee |
|---|---|
| New Issue Corporate Equity | $5,000 |
| Older Issue Corporate Equity | $3,500 |
| New Issue Municipal | $3,000 |
| Name Change | $2,000 |

Expedited processing adds 50% to the standard fee. An invoice is generated after you submit your application, with payment due within 30 days via wire transfer or ACH.

Would you like details on a specific filing type?`,
  },

  // ── Contextual / Step-Specific ──────────────────────────────────
  {
    id: 'ex-security-type-help',
    category: 'security-types',
    context: 'Foreign entity, jurisdiction step completed',
    user: "I'm not sure which security type to pick for my foreign company.",
    assistant: `For foreign-domiciled companies, the most common choices are:

- **Common Stock** — if you're filing for ordinary shares
- **American Depository Receipt (ADR)** — the most popular option for foreign companies seeking US market access. ADRs represent your foreign shares and trade on US exchanges.
- **Exchange Traded Fund (ETF)** — if your entity is a foreign-domiciled fund

If you're unsure, **ADR** is typically the right choice for foreign companies that want their shares accessible to US investors. The specific type can be confirmed with your legal counsel.

Would you like me to explain any of these in more detail?`,
  },
  {
    id: 'ex-industry-why',
    category: 'process',
    user: 'Why are you asking about my industry?',
    assistant: `Certain industries have **additional regulatory requirements** that affect the filing process:

- **Communication** — FCC ownership reporting
- **Maritime** — Jones Act US citizenship thresholds
- **Aviation** — FAA foreign ownership restrictions
- **Gaming** — State gaming commission approvals
- **REIT** — IRS qualification evidence

If your company operates in one of these sectors, selecting it ensures DTC can flag any additional documentation needed upfront, which avoids delays later.

If none apply, just select **"None of the above"** and you'll move to the next step.`,
  },
  {
    id: 'ex-corporate-action-explain',
    category: 'corporate-actions',
    user: 'What counts as a corporate action? My company just did a stock split.',
    assistant: `A **stock split** is indeed a corporate action. Select **"Stock Split"** on the current step.

When you select a corporate action, the system adjusts the filing workflow accordingly — for stock splits, you'll skip the trading check and go straight to pre-filing details.

Other corporate actions include:
- **Dividend Distribution** — stock dividends
- **Name Change** — if the issuer recently rebranded
- **Warrants** — new warrant issuance
- **Mandatory Exchange** — forced conversions or mergers

If none of these apply to your filing, select **"None of the above"** to continue with the standard new issue or older issue path.`,
  },

  // ── After Submission ────────────────────────────────────────────
  {
    id: 'ex-after-submit',
    category: 'post-submission',
    user: "I just submitted. What do I do now?",
    assistant: `Great — your filing has been created! Here's what to do next:

1. **Upload Documents** — Check the Documents section (you'll see a progress counter like "0/5"). Upload each required document.
2. **Monitor Messaging** — DTC will communicate any requests or status updates here.
3. **Track Progress** — The Progress section shows where your filing is in the review pipeline.

DTC will begin reviewing once all documents are uploaded. If anything's missing or needs clarification, you'll get a message. The typical timeline is 3–5 business days after everything is in.

Is there a specific document you need help with?`,
  },

  // ── Edge Cases ──────────────────────────────────────────────────
  {
    id: 'ex-bankruptcy',
    category: 'edge-case',
    user: 'My company is going through Chapter 11. Can I still file?',
    assistant: `Chapter 11 bankruptcy filings require a **special review process** that isn't available through the standard self-service flow yet.

For bankruptcy-related eligibility requests, I'd recommend using the **Messaging tab** (available after you create your filing) to connect directly with a DTC analyst who handles these cases.

They'll guide you through the specific requirements, which typically include court documentation and trustee authorization.

Is there anything else I can help with in the meantime?`,
  },
  {
    id: 'ex-multiple-securities',
    category: 'edge-case',
    user: 'I need to file for multiple securities at once — common stock and preferred stock.',
    assistant: `Each security type requires its own **separate filing**. You'll need to complete the application process once for your common stock and again for your preferred stock.

The good news: much of the information (corporate name, jurisdiction, industry) is the same, so the second filing will go faster.

**Tip:** Complete your common stock filing first, then start a new application for the preferred stock. Each will get its own workflow ID and CUSIP.

Would you like to continue with your current filing?`,
  },

  // ── Guardrail Examples (declining gracefully) ───────────────────
  {
    id: 'ex-legal-advice',
    category: 'guardrail',
    user: 'Should I structure this as a 144A or Reg D offering?',
    assistant: `That's an important decision, but it falls into **legal and regulatory counsel** territory — I'm not able to advise on offering structure.

I'd recommend discussing this with your **securities attorney** or **registered broker-dealer**, who can evaluate your specific situation, investor base, and regulatory requirements.

What I can tell you is that both 144A and Reg D offerings are eligible for DTC services, and you'll select the appropriate CUSIP type during the pre-filing step. Would you like me to explain the difference between CUSIP types instead?`,
  },
  {
    id: 'ex-off-topic',
    category: 'guardrail',
    user: "What's the stock price of Apple?",
    assistant: `I appreciate the question, but I'm specifically designed to help with **DTC filing and eligibility** questions. I don't have access to market data or stock prices.

For stock quotes, you can check any financial data provider like Bloomberg, Yahoo Finance, or your brokerage platform.

Is there anything about your DTC filing I can help with?`,
  },
  {
    id: 'ex-account-security',
    category: 'guardrail',
    user: 'Can you reset my password?',
    assistant: `I'm not able to access or modify account credentials for security reasons.

To reset your password, use the **"Forgot Password"** link on the login page, or contact your system administrator.

Is there anything about the filing process I can help with instead?`,
  },
];

/**
 * Selects the most relevant few-shot examples for a given query.
 * In production, this would use embedding similarity.
 */
export function selectExamples(query: string, maxExamples = 2): Example[] {
  const lower = query.toLowerCase();

  const scored = fewShotExamples.map(ex => {
    let score = 0;
    const exWords = `${ex.user} ${ex.category}`.toLowerCase();

    // Category match
    const queryWords = lower.split(/\s+/);
    for (const word of queryWords) {
      if (word.length > 3 && exWords.includes(word)) {
        score += 2;
      }
    }

    // Category keyword boost
    const categoryKeywords: Record<string, string[]> = {
      documents: ['document', 'upload', 'need', 'required', 'paperwork'],
      timelines: ['long', 'time', 'days', 'when', 'timeline', 'fast', 'quick'],
      fees: ['fee', 'cost', 'price', 'much', 'pay', 'invoice'],
      cusip: ['cusip', 'identifier', 'number'],
      'security-types': ['security', 'type', 'stock', 'adr', 'etf', 'which'],
      'corporate-actions': ['split', 'dividend', 'corporate action', 'warrants', 'name change'],
      'post-submission': ['submitted', 'after', 'next', 'done', 'now what', 'dashboard'],
      process: ['why', 'how', 'what is', 'explain', 'industry'],
      guardrail: ['should i', 'legal', 'advice', 'recommend', 'password', 'price'],
    };

    const catKws = categoryKeywords[ex.category] || [];
    for (const kw of catKws) {
      if (lower.includes(kw)) score += 3;
    }

    return { example: ex, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxExamples)
    .map(s => s.example);
}
