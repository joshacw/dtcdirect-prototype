import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SurveyProvider } from './context/SurveyContext';
import SurveyLayout from './layouts/SurveyLayout';
import AppShellLayout from './layouts/AppShellLayout';
import CorporateName from './steps/CorporateName';
import Jurisdiction from './steps/Jurisdiction';
import SecurityType from './steps/SecurityType';
import IndustryCheck from './steps/IndustryCheck';
import CorporateActionCheck from './steps/CorporateActionCheck';
import TradingCheck from './steps/TradingCheck';
import PreFilingForm from './steps/PreFilingForm';
import ReviewConfirm from './steps/ReviewConfirm';
import MunicipalName from './steps/MunicipalName';
import MunicipalSecurityType from './steps/MunicipalSecurityType';
import MunicipalConfirm from './steps/MunicipalConfirm';
import TBDStep from './steps/TBDStep';
import PostConfirmation from './steps/PostConfirmation';

export default function App() {
  return (
    <BrowserRouter>
      <SurveyProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/survey/corporate-name" replace />} />
          <Route path="/survey" element={<SurveyLayout />}>
            <Route path="corporate-name" element={<CorporateName />} />
            <Route path="jurisdiction" element={<Jurisdiction />} />
            <Route path="security-type" element={<SecurityType />} />
            <Route path="industry-check" element={<IndustryCheck />} />
            <Route path="corporate-action" element={<CorporateActionCheck />} />
            <Route path="trading-check" element={<TradingCheck />} />
            <Route path="pre-filing" element={<PreFilingForm />} />
            <Route path="review" element={<ReviewConfirm />} />
            <Route path="municipal-name" element={<MunicipalName />} />
            <Route path="municipal-security-type" element={<MunicipalSecurityType />} />
            <Route path="municipal-confirm" element={<MunicipalConfirm />} />
            <Route path="tbd" element={<TBDStep />} />
          </Route>
          <Route path="/app" element={<AppShellLayout />}>
            <Route index element={<PostConfirmation />} />
          </Route>
        </Routes>
      </SurveyProvider>
    </BrowserRouter>
  );
}
