/**
 * DTC Direct Knowledge Base
 *
 * Structured corpus the AI assistant references to answer user questions.
 * Each entry has a topic, keywords for retrieval matching, and the
 * authoritative content the assistant should draw from.
 *
 * In production this would be stored in a vector DB (Supabase pgvector)
 * and retrieved via semantic search. For the prototype we do keyword
 * matching on the `keywords` array.
 */

export interface KBEntry {
  id: string;
  topic: string;
  keywords: string[];
  content: string;
}

// ── Workflow Taxonomy ────────────────────────────────────────────────
export const workflowTaxonomy: KBEntry[] = [
  {
    id: 'wf-ni-ce',
    topic: 'New Issue Corporate Equity (WF-NI-CE)',
    keywords: ['new issue', 'corporate equity', 'new security', 'ipo', 'initial', 'first time', 'WF-NI-CE', 'NEW2'],
    content: `Workflow WF-NI-CE covers new corporate equity securities that do not yet trade on a public exchange. This is the most common filing type for companies seeking DTC eligibility for the first time.

Requirements:
- Corporate name and jurisdiction (country + state if US)
- Security type selection (Common Stock, Preferred Stock, or foreign equivalents)
- Industry classification
- No pending corporate actions
- Trading status: not currently traded on public exchanges
- Offering document (prospectus or offering memorandum)
- CUSIP number or system will apply on behalf of issuer

Typical timeline: 3–5 business days after all documents submitted.
Filing fee: starts at $5,000 for standard processing.`,
  },
  {
    id: 'wf-oi-ce',
    topic: 'Older Issue Corporate Equity (WF-OI-CE)',
    keywords: ['older issue', 'existing', 'already trading', 'listed', 'exchange traded', 'WF-OI-CE', 'OLD1'],
    content: `Workflow WF-OI-CE covers corporate equity securities that already trade on a public exchange external to DTC. This applies when an issuer wants to make an already-traded security DTC-eligible.

Requirements:
- Same as new issue (corporate info, security type, industry)
- Trading status: currently traded on public exchanges
- Existing CUSIP typically required
- Proof of exchange listing

Typical timeline: 2–3 business days (faster due to existing market data).
Filing fee: starts at $3,500.`,
  },
  {
    id: 'wf-ni-md',
    topic: 'New Issue Municipal (WF-NI-MD)',
    keywords: ['municipal', 'municipality', 'muni', 'bond', 'municipal bond', 'WF-NI-MD', 'NEW3', 'government', 'city', 'county', 'state bond'],
    content: `Workflow WF-NI-MD covers new municipal securities. Municipal filings follow a streamlined process.

Requirements:
- Municipality name
- Security status: new security
- Offering document (official statement or preliminary official statement)
- CUSIP assignment

Typical timeline: 2–3 business days.
Filing fee: $3,000 for standard processing.`,
  },
  {
    id: 'wf-oi-m',
    topic: 'Municipal Older Issue (WF-OI-M)',
    keywords: ['municipal older', 'existing municipal', 'WF-OI-M', 'OLD2'],
    content: `Workflow WF-OI-M covers existing municipal securities seeking DTC eligibility.

Requirements:
- Municipality name
- Security status: existing security
- Existing CUSIP required
- Proof of existing issuance

Typical timeline: 1–2 business days.
Filing fee: $2,500.`,
  },
  {
    id: 'wf-ca-sd',
    topic: 'Stock Distribution / Stock Split / Dividend (WF-CA-SD)',
    keywords: ['stock split', 'dividend', 'distribution', 'stock distribution', 'WF-CA-SD', 'CORP5', 'split ratio'],
    content: `Workflow WF-CA-SD covers corporate actions involving stock splits and dividend distributions. When a filing pertains to a stock split or dividend distribution, the trading check step is skipped.

Requirements:
- Corporate information (name, jurisdiction)
- Security type
- Type of action: Stock Split or Dividend Distribution
- Distribution ratio or dividend details
- Record date and effective date
- Offering document update

Typical timeline: 3–5 business days.
Filing fee: $4,000.`,
  },
  {
    id: 'wf-ca-rw',
    topic: 'Rights / Warrants (WF-CA-RW)',
    keywords: ['warrants', 'rights', 'warrant agreement', 'WF-CA-RW', 'CORP4'],
    content: `Workflow WF-CA-RW covers corporate actions involving rights offerings and warrants issuance.

Requirements:
- Corporate information
- Warrant agreement document
- Exercise terms (price, expiration date)
- Underlying security CUSIP

Note: Direct warrants filing (as a security type) is coming soon. Currently only warrants as a corporate action are supported.

Typical timeline: 5–7 business days.
Filing fee: $5,500.`,
  },
  {
    id: 'wf-ca-nc',
    topic: 'Name Change (WF-CA-NC)',
    keywords: ['name change', 'rename', 'rebrand', 'new name', 'WF-CA-NC', 'CORP3'],
    content: `Workflow WF-CA-NC covers issuer name changes for securities already DTC-eligible.

Requirements:
- Previous corporate name
- New corporate name
- Board resolution authorizing name change
- Articles of amendment or certificate of amendment
- Updated CUSIP (may be reassigned)

Typical timeline: 2–3 business days.
Filing fee: $2,000.`,
  },
  {
    id: 'wf-ca-se',
    topic: 'Stock Exchange (WF-CA-SE)',
    keywords: ['stock exchange', 'exchange', 'conversion', 'WF-CA-SE', 'CORP2'],
    content: `Workflow WF-CA-SE covers securities being exchanged (e.g., converting one class of stock to another).

Requirements:
- Details of both original and new security
- Exchange ratio
- Board resolution
- Legal opinion letter

Typical timeline: 5–7 business days.
Filing fee: $5,000.`,
  },
  {
    id: 'wf-ca-me',
    topic: 'Mandatory Exchange (WF-CA-ME)',
    keywords: ['mandatory', 'mandatory exchange', 'mandatory action', 'WF-CA-ME', 'CORP1', 'forced'],
    content: `Workflow WF-CA-ME covers mandatory corporate actions where all holders must participate (e.g., mandatory conversions, mergers).

Requirements:
- Full corporate action details
- Exchange terms
- Record and effective dates
- Legal documentation
- All holder communication proof

Typical timeline: 7–10 business days.
Filing fee: $6,000.`,
  },
];

// ── Document Requirements ────────────────────────────────────────────
export const documentRequirements: KBEntry[] = [
  {
    id: 'doc-general',
    topic: 'General Document Requirements',
    keywords: ['document', 'documents', 'what do i need', 'required', 'paperwork', 'upload', 'files'],
    content: `General documents required for most filings:

1. **Offering Document** — One of the following:
   - Prospectus (for registered offerings)
   - Offering Memorandum (for exempt offerings)
   - Private Placement Memorandum (for private placements)
   - Term Sheet (preliminary — full document required before completion)
   - Indenture (for debt securities)

2. **Corporate Formation Documents**
   - Articles of Incorporation / Certificate of Formation
   - Certificate of Good Standing (recent, within 30 days)

3. **Board Resolution** authorizing the issuance of securities

4. **Legal Opinion Letter** from qualified counsel confirming:
   - Securities are validly issued
   - Securities are fully paid and non-assessable
   - Issuer is duly organized and in good standing

5. **CUSIP Documentation** — If you have an existing CUSIP, provide confirmation. If not, the system will apply on your behalf.

6. **Transfer Agent Agreement** — Letter confirming the appointed transfer agent.

Document format: PDF preferred. Maximum file size: 25 MB per document.`,
  },
  {
    id: 'doc-municipal',
    topic: 'Municipal Document Requirements',
    keywords: ['municipal document', 'muni docs', 'official statement', 'municipal requirements'],
    content: `Documents required for municipal filings:

1. **Official Statement** (OS) or Preliminary Official Statement (POS)
2. **Bond Resolution / Ordinance** authorizing the issuance
3. **Legal Opinion** from bond counsel
4. **CUSIP Assignment** — typically handled by the underwriter
5. **Continuing Disclosure Agreement** (if applicable)
6. **Credit Enhancement Documentation** (if insured/guaranteed)

Municipal filings typically require fewer documents than corporate filings.`,
  },
  {
    id: 'doc-offering-types',
    topic: 'Offering Document Types Explained',
    keywords: ['prospectus', 'offering memorandum', 'private placement', 'term sheet', 'indenture', 'offering document type'],
    content: `Offering document types and when to use each:

- **Prospectus**: For SEC-registered public offerings. Required for securities sold to the general public under the Securities Act of 1933.

- **Offering Memorandum**: For exempt offerings (Regulation A, Regulation D). Less formal than a prospectus but still contains key information about the offering.

- **Private Placement Memorandum (PPM)**: For private placements to accredited investors. Contains risk factors, business description, and terms of the offering.

- **Term Sheet**: A preliminary document outlining key terms. A full offering document will be required before the filing can be completed.

- **Indenture**: Specifically for debt securities. A legal agreement between the issuer and the trustee detailing terms of the debt.

- **Other**: For unusual security types or structures. Contact support for guidance.`,
  },
];

// ── CUSIP Information ────────────────────────────────────────────────
export const cusipInfo: KBEntry[] = [
  {
    id: 'cusip-general',
    topic: 'CUSIP Numbers',
    keywords: ['cusip', 'cusip number', 'identifier', 'what is cusip', 'cusip meaning', '9 character', 'alphanumeric'],
    content: `A CUSIP (Committee on Uniform Securities Identification Procedures) is a unique 9-character alphanumeric identifier assigned to securities in the United States and Canada.

Format: 6 characters (issuer) + 2 characters (issue) + 1 check digit = 9 total

If you already have a CUSIP:
- Enter it during the pre-filing step
- Select the CUSIP type: Reg S, 144A, Rule 4(a)(2), Reg D, or Not Sure

If you don't have a CUSIP:
- Select "No" when asked
- The system will apply for a CUSIP on behalf of the issuer
- There is no additional fee for CUSIP application through DTC
- CUSIP assignment typically takes 1–2 business days`,
  },
  {
    id: 'cusip-types',
    topic: 'CUSIP Types Explained',
    keywords: ['reg s', '144a', 'rule 4', 'reg d', 'cusip type', 'restricted', 'regulation'],
    content: `CUSIP types and their meanings:

- **Reg S**: Securities sold outside the United States under Regulation S. Subject to restrictions on resale into the US.

- **144A**: Securities sold to Qualified Institutional Buyers (QIBs) under Rule 144A. Restricted from public trading but can be traded among QIBs.

- **Rule 4(a)(2)**: Securities issued in private transactions exempt from registration under Section 4(a)(2) of the Securities Act.

- **Reg D**: Securities offered under Regulation D exemptions (Rules 504, 506(b), 506(c)). Sold to accredited investors with limited public solicitation.

- **Not Sure**: Select this if you're unsure of the CUSIP classification. DTC will confirm the appropriate type during review.`,
  },
];

// ── Fees & Timelines ─────────────────────────────────────────────────
export const feesAndTimelines: KBEntry[] = [
  {
    id: 'fees-overview',
    topic: 'Filing Fees Overview',
    keywords: ['fee', 'fees', 'cost', 'price', 'how much', 'pricing', 'invoice', 'payment', 'charge'],
    content: `DTC Direct filing fees (standard processing):

| Filing Type | Fee |
|---|---|
| New Issue Corporate Equity (WF-NI-CE) | $5,000 |
| Older Issue Corporate Equity (WF-OI-CE) | $3,500 |
| New Issue Municipal (WF-NI-MD) | $3,000 |
| Municipal Older Issue (WF-OI-M) | $2,500 |
| Stock Distribution / Split (WF-CA-SD) | $4,000 |
| Rights / Warrants (WF-CA-RW) | $5,500 |
| Name Change (WF-CA-NC) | $2,000 |
| Stock Exchange (WF-CA-SE) | $5,000 |
| Mandatory Exchange (WF-CA-ME) | $6,000 |

Expedited processing: Add 50% to the standard fee for 1–2 business day turnaround.

Payment: An invoice is generated after you submit your application. Payment is due within 30 days. Accepted methods: wire transfer, ACH.`,
  },
  {
    id: 'timelines',
    topic: 'Processing Timelines',
    keywords: ['how long', 'timeline', 'time', 'days', 'processing time', 'turnaround', 'when', 'wait', 'duration'],
    content: `Standard processing timelines (from complete document submission):

| Filing Type | Standard | Expedited |
|---|---|---|
| New Issue Corporate Equity | 3–5 business days | 1–2 business days |
| Older Issue Corporate Equity | 2–3 business days | 1 business day |
| New Issue Municipal | 2–3 business days | 1 business day |
| Municipal Older Issue | 1–2 business days | Same day |
| Corporate Actions (Split, Dividend) | 3–5 business days | 1–2 business days |
| Name Change | 2–3 business days | 1 business day |
| Warrants / Rights | 5–7 business days | 2–3 business days |
| Mandatory Exchange | 7–10 business days | 3–5 business days |

Important: These timelines begin after ALL required documents are submitted and accepted. Incomplete submissions will delay processing. You'll receive status updates via the Messaging tab.`,
  },
];

// ── Eligibility & Rules ──────────────────────────────────────────────
export const eligibilityRules: KBEntry[] = [
  {
    id: 'dtc-eligibility',
    topic: 'DTC Eligibility Requirements',
    keywords: ['eligible', 'eligibility', 'qualify', 'requirements', 'can i', 'dtc eligible', 'who can'],
    content: `To be eligible for DTC services, a security must meet the following criteria:

1. **Issuer Requirements**
   - Must be a legally formed entity (corporation, LLC, LP, municipality, etc.)
   - Must be domiciled in a DTC-eligible country (95+ countries supported)
   - Must have a registered transfer agent (for corporate securities)

2. **Security Requirements**
   - Must be a recognized security type (equity, debt, municipal, etc.)
   - Must have or obtain a CUSIP number
   - Must meet minimum denomination requirements

3. **Regulatory Requirements**
   - Securities must comply with applicable SEC regulations
   - Restricted securities (144A, Reg S, Reg D) are eligible but subject to transfer restrictions
   - Foreign securities may require ADR structure

4. **Industries with Special Requirements**
   Communications, Maritime, Aviation, Gaming, and REIT issuers may require additional documentation or regulatory clearance.

5. **Ineligible Cases**
   - Issuers from non-eligible countries
   - Securities under active litigation preventing transfer
   - Chapter 11 Bankruptcy and Emergency filings are handled through a special process (coming soon)`,
  },
  {
    id: 'industry-special',
    topic: 'Regulated Industry Requirements',
    keywords: ['communication', 'maritime', 'aviation', 'gaming', 'reit', 'regulated', 'industry', 'special requirements', 'additional'],
    content: `Certain industries have additional requirements:

- **Communication**: May require FCC ownership reporting compliance documentation.
- **Maritime**: Subject to Jones Act requirements; may need proof of US citizenship ownership thresholds.
- **Aviation**: FAA registration requirements may apply; foreign ownership restrictions.
- **Gaming**: State gaming commission approval documentation may be required.
- **REIT (Real Estate Investment Trust)**: Must provide evidence of REIT qualification (IRS election, asset/income tests).

If your company operates in one of these industries, select it during the Industry Classification step. Additional document requirements will be communicated via the Messaging tab after submission.`,
  },
];

// ── Process & How-To ─────────────────────────────────────────────────
export const processGuides: KBEntry[] = [
  {
    id: 'process-overview',
    topic: 'Filing Process Overview',
    keywords: ['process', 'how does it work', 'steps', 'what happens', 'overview', 'flow', 'walk me through', 'guide'],
    content: `The DTC Direct filing process has three phases:

**Phase 1: Application (what you're doing now)**
1. Enter corporate/municipal information
2. Select jurisdiction and security type
3. Classify industry and corporate actions
4. Provide pre-filing details (offering document type, CUSIP, closing date)
5. Review and submit

**Phase 2: Document Upload & Review**
After submission, you'll land on your filing dashboard where you:
1. Upload required documents in the Documents section (you'll see a checklist of 0/5 or similar)
2. DTC reviews your documents for completeness
3. Any issues or requests for additional information come through the Messaging tab
4. Complete all required fields

**Phase 3: Processing & Eligibility**
1. Once all documents are accepted, DTC processes your filing
2. You'll receive status updates in real-time
3. Upon approval, your security becomes DTC-eligible
4. An invoice is generated with applicable fees`,
  },
  {
    id: 'after-submission',
    topic: 'What Happens After Submission',
    keywords: ['after submit', 'submitted', 'next steps', 'what now', 'after confirmation', 'dashboard', 'after i submit'],
    content: `After you click "Confirm & Proceed" on the review screen:

1. **Filing Created in DRAFT Status** — Your application is saved and you're taken to the filing dashboard.

2. **Dashboard Navigation**:
   - **Progress**: Track your filing status through each stage
   - **Documents (0/5)**: Upload required documents — the count shows how many you've completed
   - **Messaging**: Communicate with DTC support and receive updates
   - **History**: View a timeline of all actions and status changes

3. **Document Upload**: Upload each required document. The system will validate format and completeness.

4. **DTC Review**: A DTC analyst reviews your submission. They may request additional information via Messaging.

5. **Approval & Invoice**: Once approved, your security is DTC-eligible and an invoice is generated.

You can save progress and return at any time — your filing is automatically saved.`,
  },
  {
    id: 'edit-after-submit',
    topic: 'Editing After Submission',
    keywords: ['edit', 'change', 'modify', 'update', 'mistake', 'wrong', 'correct', 'fix'],
    content: `You can edit your filing information at several points:

**During the application (before submission):**
- Use the Back button to return to previous steps
- On the Review & Submit screen, each section has an Edit button to jump back to that step
- Changes are automatically saved

**After submission (on the dashboard):**
- Contact DTC via the Messaging tab to request changes
- Document uploads can be replaced until the review is complete
- Major changes (like security type or jurisdiction) may require a new filing

**Important:** Once DTC has begun processing your filing, changes may delay the timeline. It's best to ensure accuracy before submitting.`,
  },
];

// ── Security Type Guidance ───────────────────────────────────────────
export const securityTypeGuidance: KBEntry[] = [
  {
    id: 'security-types-us',
    topic: 'US Security Types',
    keywords: ['common stock', 'preferred stock', 'us security', 'domestic', 'security type'],
    content: `Security types available for US-domiciled issuers:

- **Common Stock**: Standard equity shares with voting rights. The most common filing type.
- **Preferred Stock**: Equity with preferential dividend/liquidation rights. May have conversion features.
- **Warrants**: Rights to purchase shares at a fixed price. Requires a warrant agreement. (Coming soon as a direct filing — currently available as a corporate action.)`,
  },
  {
    id: 'security-types-foreign',
    topic: 'Foreign Security Types',
    keywords: ['foreign', 'international', 'adr', 'depository receipt', 'etf', 'foreign security', 'non-us'],
    content: `Security types available for foreign-domiciled issuers:

- **Common Stock**: Ordinary shares of a foreign company
- **Preferred Stock**: Preference shares with priority rights
- **Limited Partnership**: LP interests in a foreign partnership
- **American Depository Receipt (ADR)**: US-traded receipts representing foreign shares. Most common for foreign issuers seeking US market access.
- **Exchange Traded Fund (ETF)**: Foreign-domiciled ETF seeking US settlement
- **Equity Derivative**: Derivative instruments linked to foreign equity
- **Warrants (requires warrant agreement)**: Foreign warrant instruments
- **Closed-End Fund**: Foreign closed-end investment fund
- **Depository Shares**: Fractional interests in preferred shares
- **Equity Unit**: Bundled units combining equity + debt components
- **Unit Investment Trust**: Fixed portfolio trust structures`,
  },
];

// ── All entries combined for retrieval ────────────────────────────────
export const allKBEntries: KBEntry[] = [
  ...workflowTaxonomy,
  ...documentRequirements,
  ...cusipInfo,
  ...feesAndTimelines,
  ...eligibilityRules,
  ...processGuides,
  ...securityTypeGuidance,
];

/**
 * Simple keyword-based retrieval.
 * In production, replace with vector similarity search.
 */
export function retrieveRelevant(query: string, maxResults = 3): KBEntry[] {
  const lower = query.toLowerCase();
  const scored = allKBEntries.map(entry => {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += kw.length; // longer keyword matches = higher relevance
      }
    }
    // Partial word matching for single important terms
    const words = lower.split(/\s+/);
    for (const word of words) {
      if (word.length > 3) {
        for (const kw of entry.keywords) {
          if (kw.toLowerCase().includes(word)) {
            score += 1;
          }
        }
      }
    }
    return { entry, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.entry);
}
