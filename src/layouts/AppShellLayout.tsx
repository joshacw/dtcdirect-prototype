import { Outlet } from 'react-router-dom';
import { FileText, MessageSquare, Clock, BarChart3, Settings, ChevronDown } from 'lucide-react';
import { useSurvey } from '../context/SurveyContext';
import SupportChat from '../components/SupportChat';

const navItems = [
  { icon: BarChart3, label: 'Progress', hasChevron: true },
  { icon: FileText, label: 'Documents', badge: '0 / 5' },
  { icon: MessageSquare, label: 'Messaging', active: true },
  { icon: Clock, label: 'History' },
];

export default function AppShellLayout() {
  const { state } = useSurvey();
  const name = state.corporateName || state.municipalName || 'Company';

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-[280px] flex-col justify-between bg-sidebar p-6">
        <div>
          <div className="mb-10 text-lg font-bold text-white">
            {name}
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map(({ icon: Icon, label, hasChevron, badge, active }) => (
              <button
                key={label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  active
                    ? 'text-accent'
                    : 'text-gray-300 hover:bg-sidebar-light hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
                {badge && (
                  <span className="ml-auto rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                    {badge}
                  </span>
                )}
                {hasChevron && <ChevronDown size={14} className="ml-auto" />}
              </button>
            ))}
          </nav>
        </div>
        {/* Need help */}
        <div className="text-sm text-gray-400">
          <p className="font-semibold text-gray-300">Need help?</p>
          <p className="mt-1">
            Get connected with the help you need —{' '}
            <SupportChat variant="dark" filingContext={state} />.
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <span>Filings</span>
            <span>&rsaquo;</span>
            <span>Manage</span>
            <span>&rsaquo;</span>
            <span className="font-medium text-gray-900">{name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              ABC123XYZ
            </span>
            <button className="text-gray-400 hover:text-gray-600">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex flex-1 flex-col bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
