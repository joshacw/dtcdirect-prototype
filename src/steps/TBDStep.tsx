import TBDPlaceholder from '../components/TBDPlaceholder';
import { useNavigationConfig } from '../context/NavigationContext';

export default function TBDStep() {
  useNavigationConfig({ currentStepId: 'tbd', canContinue: false });

  return (
    <div className="flex flex-col gap-6">
      <TBDPlaceholder />
    </div>
  );
}
