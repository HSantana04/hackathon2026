import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layouts/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ConsultantDashboard } from './pages/ConsultantDashboard';
import { Clients } from './pages/Clients';
import { ClientDetail } from './pages/ClientDetail';
import { UploadStatement } from './pages/UploadStatement';
import { ReviewExtraction } from './pages/ReviewExtraction';
import { B3Assets } from './pages/B3Assets';
import { FgcCoverage } from './pages/FgcCoverage';
import { Goals } from './pages/Goals';
import { CreateAccountPage } from './pages/CreateAccountPage';
import { ClientDashboard } from './pages/ClientDashboard';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes (no Layout) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />

        {/* Dashboard routes (with Layout) */}
        <Route path="/dashboard" element={<Layout><ConsultantDashboard /></Layout>} />
        <Route path="/client-dashboard" element={<Layout><ClientDashboard /></Layout>} />
        <Route path="/clients" element={<Layout><Clients /></Layout>} />
        <Route path="/client/:id" element={<Layout><ClientDetail /></Layout>} />
        <Route path="/client/:id/fgc" element={<Layout><FgcCoverage /></Layout>} />
        <Route path="/client/:id/goals" element={<Layout><Goals /></Layout>} />
        <Route path="/upload" element={<Layout><UploadStatement /></Layout>} />
        <Route path="/review" element={<Layout><ReviewExtraction /></Layout>} />
        <Route path="/b3-assets" element={<Layout><B3Assets /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
};
