/**
 * DTC Direct AI Agent — Orchestration Layer
 *
 * Assembles the system prompt, retrieves relevant knowledge,
 * selects few-shot examples, and produces a response.
 *
 * Architecture:
 *   User message
 *     → retrieve relevant KB entries (keyword match → vector search in prod)
 *     → select few-shot examples
 *     → build full prompt (system + context + KB + examples + conversation)
 *     → call LLM (simulated locally, real API in production)
 *     → return response
 *
 * In production:
 *   - Replace `generateResponse` with a Convex action that calls
 *     the Anthropic API (Claude) or OpenAI
 *   - Replace keyword retrieval with pgvector similarity search
 *   - Add conversation persistence via Convex mutations
 *   - Add rate limiting and abuse detection
 */

import { retrieveRelevant, type KBEntry } from './knowledgeBase';
import { buildSystemPrompt, formatFilingContext } from './systemPrompt';
import { selectExamples, type Example } from './examples';

// ── Types ────────────────────────────────────────────────────────────

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface FilingContext {
  corporateName?: string;
  isMunicipal?: boolean;
  municipalName?: string;
  country?: string;
  usState?: string;
  securityType?: string;
  industries?: string[];
  corporateAction?: string;
  tradesOnExchange?: boolean | null;
  currentStep?: string;
}

export interface AgentConfig {
  /** LLM API key — in prod, this would be server-side only */
  apiKey?: string;
  /** Model to use */
  model?: string;
  /** Max tokens for response */
  maxTokens?: number;
  /** Whether to use the real API or local simulation */
  useRealAPI?: boolean;
}

const DEFAULT_CONFIG: AgentConfig = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 500,
  useRealAPI: false,
};

// ── Core Agent ───────────────────────────────────────────────────────

export class DTCAgent {
  private config: AgentConfig;

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a response to the user's message.
   */
  async respond(
    userMessage: string,
    conversationHistory: Message[],
    filingContext?: FilingContext,
  ): Promise<string> {
    // 1. Retrieve relevant knowledge
    const kbEntries = retrieveRelevant(userMessage, 3);
    const kbContext = this.formatKBEntries(kbEntries);

    // 2. Select few-shot examples
    const examples = selectExamples(userMessage, 2);

    // 3. Build filing context string
    const filingCtx = filingContext
      ? formatFilingContext(filingContext)
      : '';

    // 4. Assemble full system prompt
    const systemPrompt = buildSystemPrompt(kbContext, filingCtx);

    // 5. Build messages array
    const messages = this.buildMessages(
      systemPrompt,
      examples,
      conversationHistory,
      userMessage,
    );

    // 6. Generate response
    if (this.config.useRealAPI && this.config.apiKey) {
      return this.callAPI(messages);
    }
    return this.simulateResponse(userMessage, kbEntries, filingContext);
  }

  // ── Private Methods ──────────────────────────────────────────────

  private formatKBEntries(entries: KBEntry[]): string {
    if (entries.length === 0) return '';
    return entries
      .map(e => `### ${e.topic}\n${e.content}`)
      .join('\n\n');
  }

  private buildMessages(
    systemPrompt: string,
    examples: Example[],
    history: Message[],
    userMessage: string,
  ): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add few-shot examples
    for (const ex of examples) {
      messages.push({ role: 'user', content: ex.user });
      messages.push({ role: 'assistant', content: ex.assistant });
    }

    // Add conversation history (last 10 messages for context window)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    return messages;
  }

  /**
   * Call the real LLM API.
   * In production, this runs as a Convex action (server-side)
   * so the API key is never exposed to the client.
   */
  private async callAPI(
    messages: Array<{ role: string; content: string }>,
  ): Promise<string> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          system: messages[0].content,
          messages: messages.slice(1).map(m => ({
            role: m.role === 'system' ? 'user' : m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('API error:', err);
        return this.fallbackResponse();
      }

      const data = await response.json();
      return data.content?.[0]?.text || this.fallbackResponse();
    } catch (error) {
      console.error('API call failed:', error);
      return this.fallbackResponse();
    }
  }

  /**
   * Simulated response for prototype / offline demo.
   * Uses retrieved KB entries to construct a contextual answer.
   */
  private simulateResponse(
    query: string,
    kbEntries: KBEntry[],
    filingContext?: FilingContext,
  ): string {
    const lower = query.toLowerCase();

    // If we have relevant KB entries, use the best one
    if (kbEntries.length > 0) {
      const best = kbEntries[0];
      let response = this.condenseContent(best.content);

      // Add contextual follow-up based on filing state
      if (filingContext?.currentStep) {
        response += `\n\nI see you're currently on the **${this.stepLabel(filingContext.currentStep)}** step. Let me know if you need help with anything specific to this step.`;
      } else if (filingContext?.corporateName || filingContext?.municipalName) {
        const name = filingContext.corporateName || filingContext.municipalName;
        response += `\n\nIs there anything else about the filing for **${name}** I can help with?`;
      } else {
        response += '\n\nWould you like to know more about any of these details?';
      }

      return response;
    }

    // Fallback for unmatched queries
    return this.fallbackResponse();
  }

  /**
   * Condense long KB content to a conversational response.
   * Extracts key points and reformats for chat.
   */
  private condenseContent(content: string): string {
    // Remove markdown tables (convert to prose)
    let condensed = content
      .replace(/\|[^\n]+\|/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Truncate very long content
    if (condensed.length > 800) {
      const sentences = condensed.split(/\.\s+/);
      condensed = sentences.slice(0, 6).join('. ') + '.';
    }

    return condensed;
  }

  private stepLabel(stepId: string): string {
    const labels: Record<string, string> = {
      'corporate-name': 'Corporate Name',
      'jurisdiction': 'Jurisdiction',
      'security-type': 'Security Type',
      'industry-check': 'Industry Classification',
      'corporate-action': 'Corporate Action',
      'trading-check': 'Trading Check',
      'pre-filing': 'Pre-Filing',
      'review': 'Review & Submit',
      'municipal-name': 'Municipality Name',
      'municipal-security-type': 'Security Status',
      'municipal-confirm': 'Confirm Filing',
    };
    return labels[stepId] || stepId;
  }

  private fallbackResponse(): string {
    return `I appreciate your question! I can help with topics like:

- **Required documents** for your filing
- **Processing timelines** and expedited options
- **Fees** and payment information
- **CUSIP numbers** and how they work
- **Security types** and which to choose
- **The filing process** step by step

For more specific questions outside these areas, I'd recommend using the **Messaging tab** after submission to connect with a DTC analyst.

What would you like to know more about?`;
  }
}

// ── Singleton instance ───────────────────────────────────────────────
let agentInstance: DTCAgent | null = null;

export function getAgent(config?: Partial<AgentConfig>): DTCAgent {
  if (!agentInstance || config) {
    agentInstance = new DTCAgent(config);
  }
  return agentInstance;
}

/**
 * Convenience function for quick one-off responses.
 */
export async function askAgent(
  question: string,
  history: Message[] = [],
  filingContext?: FilingContext,
): Promise<string> {
  const agent = getAgent();
  return agent.respond(question, history, filingContext);
}
