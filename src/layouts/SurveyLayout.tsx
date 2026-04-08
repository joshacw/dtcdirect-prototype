import { Outlet } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import NeedHelp from '../components/NeedHelp';
import StepNavigation from '../components/StepNavigation';
import { NavigationProvider, useNavigation } from '../context/NavigationContext';

function SurveyLayoutInner() {
  const navConfig = useNavigation();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Top: wordmark */}
      <div className="flex justify-center px-8 pt-8">
        <div className="flex items-baseline gap-1 text-xl font-bold">
          <span className="text-accent">DTC</span>
          <span className="text-gray-900">Direct</span>
        </div>
      </div>

      {/* Middle: vertically centered content */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="flex w-full max-w-[500px] flex-col">
          <Outlet />
        </div>
      </div>

      {/* Bottom: progress + help + nav buttons */}
      <div className="flex flex-col items-center gap-6 px-8 pb-8">
        <div className="w-full max-w-[500px]">
          <ProgressBar />
        </div>
        <NeedHelp />
        {navConfig && navConfig.currentStepId !== 'review' && navConfig.currentStepId !== 'municipal-confirm' && (
          <div className="w-full max-w-[900px]">
            <StepNavigation
              currentStepId={navConfig.currentStepId}
              canContinue={navConfig.canContinue}
              onContinue={navConfig.onContinue}
              continueLabel={navConfig.continueLabel}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SurveyLayout() {
  return (
    <NavigationProvider>
      <SurveyLayoutInner />
    </NavigationProvider>
  );
}
