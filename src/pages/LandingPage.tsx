import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MessageSquare, List, FileText, Phone, Mic, MicOff } from 'lucide-react';
import SupportChat from '../components/SupportChat';
import VoiceCall from '../components/VoiceCall';

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [listening, setListening] = useState(false);
  const navigate = useNavigate();

  const toggleSpeechToText = () => {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (listening) {
      setListening(false);
      return;
    }

    const recognition = new (SpeechRecognition as new () => SpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setPrompt(transcript);
    };
    recognition.start();
  };

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
              <div className="rounded-xl border border-gray-200 bg-gray-50 shadow-sm transition-colors focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
                <div className="flex items-start pt-3">
                  <MessageSquare size={18} className="ml-4 mt-0.5 shrink-0 text-gray-400" />
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (prompt.trim()) {
                          const form = e.currentTarget.closest('form');
                          form?.requestSubmit();
                        }
                      }
                    }}
                    placeholder="Describe your filing need…"
                    rows={3}
                    className="flex-1 resize-none bg-transparent px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-1.5 px-3 pb-3">
                  <button
                    type="button"
                    onClick={toggleSpeechToText}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                      listening
                        ? 'border-red-300 bg-red-50 text-red-500'
                        : 'border-gray-200 text-gray-400 hover:border-accent hover:bg-accent-light hover:text-accent'
                    }`}
                    title={listening ? 'Stop listening' : 'Voice to text'}
                  >
                    {listening ? <MicOff size={15} /> : <Mic size={15} />}
                  </button>
                  <button
                    type="submit"
                    disabled={!prompt.trim()}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary-hover disabled:opacity-30"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
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
            <button
              onClick={() => setShowVoiceCall(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              <Phone size={16} className="text-gray-400" />
              Talk with support
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

      {showVoiceCall && (
        <VoiceCall
          onClose={() => setShowVoiceCall(false)}
        />
      )}
    </div>
  );
}
