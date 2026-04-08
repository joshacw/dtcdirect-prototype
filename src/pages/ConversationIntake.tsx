import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowRight, Bot, Check, Pencil } from 'lucide-react';
import { useSurvey } from '../context/SurveyContext';
import type { ResolvedWorkflow } from '../config/routingMatrix';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

interface ExtractedFields {
  corporateName?: string;
  isMunicipal?: boolean;
  municipalName?: string;
  country?: string;
  usState?: string;
  entityType?: 'us' | 'foreign' | null;
  securityType?: string;
  corporateAction?: string;
  tradesOnExchange?: boolean | null;
  industries?: string[];
}

interface RoutingResult {
  workflow: ResolvedWorkflow;
  summary: string;
  fields: ExtractedFields;
}

export default function ConversationIntake() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useSurvey();
  const initialMessage = (location.state as { initialMessage?: string })?.initialMessage || '';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: 'assistant',
      text: "Hi! I'm the DTC Direct assistant. Tell me about your company and what you're looking to file, and I'll set up the right application for you.",
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [extractedFields, setExtractedFields] = useState<ExtractedFields>({});
  const [routingResult, setRoutingResult] = useState<RoutingResult | null>(null);
  const [editingFields, setEditingFields] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const sentInitial = useRef(false);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // Send initial message from landing page
  useEffect(() => {
    if (initialMessage && !sentInitial.current) {
      sentInitial.current = true;
      send(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || streaming) return;

    const userMsg: ChatMessage = { id: nextId.current++, role: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    // Build history for API
    const history = messages
      .filter(m => m.id > 0)
      .map(m => ({ role: m.role, content: m.text }));
    history.push({ role: 'user' as const, content: msg });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          extractedFields,
        }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();

      // Handle tool calls (extracted fields)
      if (data.toolCalls) {
        const newFields = { ...extractedFields };
        for (const call of data.toolCalls) {
          switch (call.name) {
            case 'setIssuerDetails':
              if (call.args.name) newFields.corporateName = call.args.name;
              if (call.args.country) newFields.country = call.args.country;
              if (call.args.state) newFields.usState = call.args.state;
              if (call.args.entity_type) newFields.entityType = call.args.entity_type;
              if (call.args.is_municipal) {
                newFields.isMunicipal = true;
                newFields.municipalName = call.args.name;
              }
              break;
            case 'setSecurityType':
              newFields.securityType = call.args.type;
              break;
            case 'setCorporateAction':
              newFields.corporateAction = call.args.action;
              break;
            case 'setTradingStatus':
              newFields.tradesOnExchange = call.args.trades_on_exchange;
              break;
            case 'setIndustry':
              newFields.industries = call.args.industries;
              break;
            case 'confirmRouting':
              setRoutingResult({
                workflow: {
                  workflowId: call.args.workflow_id,
                  filingType: call.args.filing_type,
                },
                summary: call.args.summary,
                fields: newFields,
              });
              break;
          }
        }
        setExtractedFields(newFields);
      }

      // Add assistant message
      if (data.message) {
        setMessages(prev => [
          ...prev,
          { id: nextId.current++, role: 'assistant', text: data.message },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: nextId.current++,
          role: 'assistant',
          text: "I'm sorry, I had trouble processing that. Could you try again?",
        },
      ]);
    } finally {
      setStreaming(false);
    }
  }, [input, messages, streaming, extractedFields]);

  const handleConfirm = () => {
    if (!routingResult) return;
    const f = routingResult.fields;

    // Populate SurveyContext
    if (f.corporateName) dispatch({ type: 'SET_FIELD', field: 'corporateName', value: f.corporateName });
    if (f.isMunicipal) dispatch({ type: 'SET_FIELD', field: 'isMunicipal', value: true });
    if (f.municipalName) dispatch({ type: 'SET_FIELD', field: 'municipalName', value: f.municipalName });
    if (f.country) dispatch({ type: 'SET_FIELD', field: 'country', value: f.country });
    if (f.usState) dispatch({ type: 'SET_FIELD', field: 'usState', value: f.usState });
    if (f.entityType) dispatch({ type: 'SET_FIELD', field: 'entityType', value: f.entityType });
    if (f.securityType) dispatch({ type: 'SET_FIELD', field: 'securityType', value: f.securityType });
    if (f.corporateAction) dispatch({ type: 'SET_FIELD', field: 'corporateAction', value: f.corporateAction });
    if (f.tradesOnExchange !== undefined && f.tradesOnExchange !== null) {
      dispatch({ type: 'SET_FIELD', field: 'tradesOnExchange', value: f.tradesOnExchange });
    }
    if (f.industries?.length) dispatch({ type: 'SET_FIELD', field: 'industries', value: f.industries });

    navigate('/auth', {
      state: {
        workflow: routingResult.workflow,
        source: 'conversation',
      },
    });
  };

  const fieldCount = Object.values(extractedFields).filter(v =>
    v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-baseline gap-1 text-xl font-bold">
          <span className="text-accent">DTC</span>
          <span className="text-gray-900">Direct</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Start over
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex flex-1 flex-col">
          <div ref={scrollRef} className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-6">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-light">
                    <Bot size={14} className="text-accent" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {renderMarkdown(msg.text)}
                </div>
              </div>
            ))}
            {streaming && (
              <div className="flex justify-start">
                <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-light">
                  <Bot size={14} className="text-accent" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl bg-gray-100 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Confirmation card */}
            {routingResult && !editingFields && (
              <div className="mx-auto mt-4 w-full max-w-md rounded-xl border border-accent/20 bg-accent-light p-5">
                <div className="flex items-center gap-2 text-accent">
                  <Check size={18} />
                  <span className="text-sm font-semibold">Filing Identified</span>
                </div>
                <p className="mt-2 text-sm text-gray-700">{routingResult.summary}</p>
                <div className="mt-3 space-y-1.5">
                  <FieldRow label="Workflow" value={routingResult.workflow.filingType} />
                  {routingResult.fields.corporateName && (
                    <FieldRow label="Company" value={routingResult.fields.corporateName} />
                  )}
                  {routingResult.fields.municipalName && (
                    <FieldRow label="Municipality" value={routingResult.fields.municipalName} />
                  )}
                  {routingResult.fields.country && (
                    <FieldRow label="Jurisdiction" value={`${routingResult.fields.country}${routingResult.fields.usState ? `, ${routingResult.fields.usState}` : ''}`} />
                  )}
                  {routingResult.fields.securityType && (
                    <FieldRow label="Security" value={routingResult.fields.securityType} />
                  )}
                  {routingResult.fields.corporateAction && routingResult.fields.corporateAction !== 'None' && (
                    <FieldRow label="Corporate Action" value={routingResult.fields.corporateAction} />
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleConfirm}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
                  >
                    Confirm & Continue
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => setEditingFields(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                </div>
              </div>
            )}

            {/* Edit mode — let the user correct via chat */}
            {editingFields && (
              <div className="mx-auto mt-4 w-full max-w-md rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                  Tell me what needs to change and I'll update the details.
                </p>
                <button
                  onClick={() => setEditingFields(false)}
                  className="mt-2 text-sm font-medium text-accent hover:underline"
                >
                  Looks good, go back
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 px-6 py-4">
            <div className="mx-auto flex max-w-2xl items-center gap-2">
              <div className="flex flex-1 items-center rounded-xl border border-gray-200 bg-gray-50 transition-colors focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder={routingResult ? 'Ask a follow-up or correct something…' : 'Describe your filing need…'}
                  disabled={streaming}
                  className="h-11 flex-1 bg-transparent px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || streaming}
                  className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-30"
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side panel: extracted fields */}
        {fieldCount > 0 && (
          <div className="hidden w-72 shrink-0 border-l border-gray-100 bg-gray-50/50 p-5 lg:block">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Extracted Details
            </h3>
            <div className="mt-3 space-y-2">
              {extractedFields.corporateName && (
                <ExtractedItem label="Company" value={extractedFields.corporateName} />
              )}
              {extractedFields.municipalName && (
                <ExtractedItem label="Municipality" value={extractedFields.municipalName} />
              )}
              {extractedFields.country && (
                <ExtractedItem
                  label="Jurisdiction"
                  value={`${extractedFields.country}${extractedFields.usState ? `, ${extractedFields.usState}` : ''}`}
                />
              )}
              {extractedFields.entityType && (
                <ExtractedItem label="Entity Type" value={extractedFields.entityType === 'us' ? 'US' : 'Foreign'} />
              )}
              {extractedFields.securityType && (
                <ExtractedItem label="Security Type" value={extractedFields.securityType} />
              )}
              {extractedFields.corporateAction && extractedFields.corporateAction !== 'None' && (
                <ExtractedItem label="Corporate Action" value={extractedFields.corporateAction} />
              )}
              {extractedFields.tradesOnExchange !== undefined && extractedFields.tradesOnExchange !== null && (
                <ExtractedItem label="Trades on Exchange" value={extractedFields.tradesOnExchange ? 'Yes' : 'No'} />
              )}
              {extractedFields.industries && extractedFields.industries.length > 0 && (
                <ExtractedItem label="Industry" value={extractedFields.industries.join(', ')} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function ExtractedItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-2.5 shadow-sm">
      <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-gray-800">{value}</div>
    </div>
  );
}

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="ml-4 mt-1 list-disc space-y-0.5">
          {listItems.map((item, i) => (
            <li key={i}>{parseBold(item)}</li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('- ') || line.startsWith('• ')) {
      listItems.push(line.slice(2));
    } else if (/^\d+\.\s/.test(line)) {
      listItems.push(line.replace(/^\d+\.\s/, ''));
    } else {
      flushList();
      if (line === '') {
        if (elements.length > 0) elements.push(<br key={`br-${i}`} />);
      } else {
        elements.push(
          <p key={`p-${i}`} className={i > 0 ? 'mt-1.5' : ''}>
            {parseBold(line)}
          </p>,
        );
      }
    }
  }
  flushList();
  return <>{elements}</>;
}

function parseBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  );
}
