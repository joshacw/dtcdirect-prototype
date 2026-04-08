import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AuthGate() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as { workflow?: { workflowId: string; filingType: string }; source?: string } | null;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: auto-proceed to app dashboard
    navigate('/app', { state: routeState });
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

      {/* Center */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-[400px] flex-col">
          <h1 className="text-center text-2xl font-semibold text-gray-900">Sign in to continue</h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            Create an account or sign in to save your filing and proceed
          </p>

          {/* Show workflow if coming from intake */}
          {routeState?.workflow && (
            <div className="mt-6 rounded-lg border border-accent/20 bg-accent-light px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-wider text-accent">Your filing</div>
              <div className="mt-0.5 text-sm font-medium text-gray-900">{routeState.workflow.filingType}</div>
            </div>
          )}

          <form onSubmit={handleProceed} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 h-11 w-full rounded-lg bg-primary text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={handleProceed}
              className="h-11 w-full rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Create Account
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            Prototype — clicking either button will proceed to the dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
