import { FileText, ArrowUp } from 'lucide-react';
import { useState } from 'react';
import { useSurvey } from '../context/SurveyContext';

export default function PostConfirmation() {
  const { state } = useSurvey();
  const [message, setMessage] = useState('');
  const name = state.corporateName || state.municipalName || 'your company';

  return (
    <div className="flex flex-1 flex-col">
      {/* Page heading */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Messaging</h1>
        <p className="mt-1 text-base text-gray-600">
          Easily view and respond to messages related to your filing application.
        </p>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col rounded-lg border border-gray-200 bg-white">
        {/* Date header */}
        <div className="py-4 text-center text-sm text-gray-500">
          Wednesday, March 12th
        </div>

        {/* Welcome card */}
        <div className="mx-6 mb-4 overflow-hidden rounded-lg bg-gradient-to-b from-primary to-accent p-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <FileText size={40} className="text-white/90" />
          </div>
          <h2 className="text-xl font-semibold">
            Let's get your application completed!
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/90">
            Hello, welcome to your support page to complete your application for
            New Issue Corporate Equity for <strong>{name}</strong>.
          </p>
          <p className="mt-2 text-sm text-white/90">
            On this screen, you will find the remaining information we need to
            confirm. To continue, click on the <strong>Progress link</strong>.
          </p>
          <button className="mt-5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-gray-50">
            Continue to Progress
          </button>
        </div>

        {/* User message bubble */}
        <div className="flex flex-col items-end px-6 pb-4">
          <div className="rounded-lg bg-primary px-4 py-2.5 text-sm text-white">
            Great, thank you for the update!
          </div>
          <span className="mt-1 text-xs text-gray-400">10:35 AM</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Message input */}
        <div className="flex items-center gap-3 border-t border-gray-200 px-4 py-3">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="h-10 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
          />
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-primary-hover">
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
