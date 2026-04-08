import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MessageSquare, List, FileText } from 'lucide-react';
import SupportChat from '../components/SupportChat';

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = prompt.trim();
    if (!msg) return;
    navigate('/chat', { state: { initialMessage: msg } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Top: wordmark */}
      <div className="flex justify-center px-8 pt-8">
        <div className="flex items-baseline gap-1 text-xl font-bold">
          <span className="text-accent">DTC</span>
          <span className="text-gray-900">Direct</span>
        </div>
      </div>

      {/* Center: main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-[560px] flex-col items-center">
          {/* Headline */}
          <h1 className="text-center text-3xl font-semibold tracking-tight text-gray-900">
            Get Your Securities DTC Eligible
          </h1>
          <p className="mt-3 text-center text-base text-gray-500">
            Tell us what you need and we'll guide you through the right filing process
          </p>

          {/* Prompt box */}
          <form onSubmit={handleSubmit} className="mt-8 w-full">
            <div className="relative">
              <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 shadow-sm transition-colors focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
                <MessageSquare size={18} className="ml-4 shrink-0 text-gray-400" />
                <input
                  type="text"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Describe your filing need…"
                  className="h-12 flex-1 bg-transparent px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary-hover disabled:opacity-30"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6 flex w-full items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Alternative paths */}
          <div className="mt-6 flex w-full gap-3">
            <button
              onClick={() => navigate('/survey/corporate-name')}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              <List size={16} className="text-gray-400" />
              Take the survey
            </button>
            <button
              onClick={() => navigate('/select')}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              <FileText size={16} className="text-gray-400" />
              I know my filing type
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: help link */}
      <div className="flex justify-center px-8 pb-8">
        <span className="text-sm text-gray-500">
          Need help? <SupportChat />
        </span>
      </div>
    </div>
  );
}
