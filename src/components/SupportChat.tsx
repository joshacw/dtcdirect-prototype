import { useState, useRef, useEffect, useCallback } from 'react';
import { X, ArrowUp, Bot } from 'lucide-react';
import { askAgent, type Message as AgentMessage, type FilingContext } from '../ai/agent';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

interface Props {
  variant?: 'light' | 'dark';
  filingContext?: FilingContext;
}

const QUICK_TOPICS = [
  'What documents do I need?',
  'How long does it take?',
  'What is a CUSIP?',
  'What are the fees?',
];

export default function SupportChat({ variant = 'light', filingContext }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: 'assistant',
      text: "Hi! I'm the DTC Direct assistant. I can help answer questions about the filing process, required documents, fees, and more. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;

    const userMsg: ChatMessage = { id: nextId.current++, role: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Build conversation history for the agent
    const history: AgentMessage[] = messages
      .filter(m => m.id > 0) // skip the initial greeting
      .map(m => ({ role: m.role, content: m.text }));

    try {
      const response = await askAgent(msg, history, filingContext);
      setMessages(prev => [
        ...prev,
        { id: nextId.current++, role: 'assistant', text: response },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: nextId.current++,
          role: 'assistant',
          text: "I'm sorry, I encountered an issue processing your question. Please try again or use the Messaging tab to connect with a DTC analyst.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  }, [input, messages, filingContext]);

  const linkColor = variant === 'dark' ? 'text-accent' : 'text-accent';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline font-semibold ${linkColor} hover:underline`}
      >
        chat with support
      </button>

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[400px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-4 py-3">
            <div className="flex items-center gap-2 text-white">
              <Bot size={18} />
              <div>
                <span className="text-sm font-semibold">DTC Direct Support</span>
                <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">AI</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {renderMarkdown(msg.text)}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick topics — only on initial state */}
          {messages.length <= 1 && !typing && (
            <div className="flex flex-wrap gap-1.5 border-t border-gray-100 px-4 py-2.5">
              {QUICK_TOPICS.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition hover:border-accent hover:bg-accent-light hover:text-accent"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-gray-200 px-3 py-2.5">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask a question..."
              disabled={typing}
              className="h-9 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || typing}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-primary-hover disabled:opacity-40"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Minimal markdown rendering for chat bubbles.
 * Handles **bold**, bullet lists, and line breaks.
 */
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
        </ul>
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
        if (elements.length > 0) {
          elements.push(<br key={`br-${i}`} />);
        }
      } else {
        elements.push(
          <p key={`p-${i}`} className={i > 0 ? 'mt-1.5' : ''}>
            {parseBold(line)}
          </p>
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
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}
