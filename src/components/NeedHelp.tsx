import SupportChat from './SupportChat';
import { useSurvey } from '../context/SurveyContext';

export default function NeedHelp() {
  const { state } = useSurvey();

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="text-lg font-semibold text-gray-900">Need help?</p>
      <p className="text-base text-gray-600">
        Get connected with the help you need —{' '}
        <SupportChat filingContext={state} />.
      </p>
    </div>
  );
}
