import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import Vapi from '@vapi-ai/web';

interface TranscriptEntry {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  final: boolean;
}

interface Props {
  onClose: () => void;
  onTranscriptComplete?: (transcript: TranscriptEntry[]) => void;
}

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || '';
const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID || '';

export default function VoiceCall({ onClose, onTranscriptComplete }: Props) {
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [duration, setDuration] = useState(0);
  const vapiRef = useRef<Vapi | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Timer
  useEffect(() => {
    if (callStatus === 'active') {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const startCall = useCallback(async () => {
    if (!VAPI_PUBLIC_KEY || !VAPI_ASSISTANT_ID) {
      setTranscript([{
        id: nextId.current++,
        role: 'assistant',
        text: 'Voice calling is not configured yet. Please set VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID environment variables.',
        final: true,
      }]);
      setCallStatus('ended');
      return;
    }

    setCallStatus('connecting');

    try {
      const vapi = new Vapi(VAPI_PUBLIC_KEY);
      vapiRef.current = vapi;

      vapi.on('call-start', () => {
        setCallStatus('active');
        setTranscript([{
          id: nextId.current++,
          role: 'assistant',
          text: 'Connected. Tell me about your company and filing needs.',
          final: true,
        }]);
      });

      vapi.on('call-end', () => {
        setCallStatus('ended');
        if (timerRef.current) clearInterval(timerRef.current);
      });

      vapi.on('speech-start', () => {
        // User started speaking — add placeholder
        setTranscript(prev => [
          ...prev,
          { id: nextId.current++, role: 'user', text: '…', final: false },
        ]);
      });

      vapi.on('message', (msg: Record<string, unknown>) => {
        if (msg.type === 'transcript') {
          const role = msg.role as 'user' | 'assistant';
          const text = msg.transcript as string;
          const isFinal = msg.transcriptType === 'final';

          if (role === 'user') {
            setTranscript(prev => {
              const last = [...prev];
              const idx = last.findLastIndex(t => t.role === 'user' && !t.final);
              if (idx >= 0) {
                last[idx] = { ...last[idx], text, final: isFinal };
              }
              return last;
            });
          } else if (role === 'assistant' && isFinal) {
            setTranscript(prev => [
              ...prev,
              { id: nextId.current++, role: 'assistant', text, final: true },
            ]);
          }
        }
      });

      vapi.on('error', (err) => {
        console.error('VAPI error:', err);
        setTranscript(prev => [
          ...prev,
          { id: nextId.current++, role: 'assistant', text: 'Call encountered an error. Please try again.', final: true },
        ]);
        setCallStatus('ended');
      });

      await vapi.start(VAPI_ASSISTANT_ID);
    } catch (err) {
      console.error('Failed to start call:', err);
      setCallStatus('ended');
    }
  }, []);

  const endCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    setCallStatus('ended');
    if (timerRef.current) clearInterval(timerRef.current);
    onTranscriptComplete?.(transcript.filter(t => t.final));
  }, [transcript, onTranscriptComplete]);

  const toggleMute = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex h-[600px] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-primary px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1 text-lg font-bold">
                <span className="text-accent-light">DTC</span>
                <span className="text-white">Direct</span>
              </div>
              <p className="mt-0.5 text-xs text-white/60">Voice Filing Assistant</p>
            </div>
            {callStatus === 'active' && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                <span className="text-sm font-medium text-white">{formatTime(duration)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Transcript area */}
        <div ref={scrollRef} className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {callStatus === 'idle' && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-light">
                <Phone size={28} className="text-accent" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">Start a Voice Call</h2>
              <p className="mt-1.5 max-w-[280px] text-sm text-gray-500">
                Speak with our AI assistant to set up your filing. Your conversation will be transcribed in real time.
              </p>
              <button
                onClick={startCall}
                className="mt-6 flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-hover"
              >
                <Phone size={16} />
                Start Call
              </button>
            </div>
          )}

          {callStatus === 'connecting' && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-light">
                <Phone size={28} className="animate-pulse text-accent" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-600">Connecting…</p>
            </div>
          )}

          {(callStatus === 'active' || callStatus === 'ended') && transcript.map(entry => (
            <div key={entry.id}>
              {entry.role === 'user' ? (
                <div className="flex justify-end">
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed text-white ${entry.final ? 'bg-primary' : 'bg-primary/60'}`}>
                    {entry.text}
                  </div>
                </div>
              ) : (
                <div className="text-sm leading-relaxed text-gray-800">
                  {entry.text}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="border-t border-gray-100 px-6 py-4">
          {callStatus === 'active' ? (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleMute}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                  isMuted
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                onClick={endCall}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600"
              >
                <PhoneOff size={22} />
              </button>
              <div className="h-12 w-12" /> {/* spacer for centering */}
            </div>
          ) : callStatus === 'ended' ? (
            <div className="flex gap-3">
              <button
                onClick={() => { setCallStatus('idle'); setTranscript([]); setDuration(0); }}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Call Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Back to Chat
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
