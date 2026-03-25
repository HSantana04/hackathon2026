import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layouts/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ConsultantDashboard } from './pages/ConsultantDashboard';
import { Clients } from './pages/Clients';
import { ClientDetail } from './pages/ClientDetail';
import { UploadStatement } from './pages/UploadStatement';
import { ReviewExtraction } from './pages/ReviewExtraction';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes (no Layout) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard routes (with Layout) */}
        <Route path="/dashboard" element={<Layout><ConsultantDashboard /></Layout>} />
        <Route path="/clients" element={<Layout><Clients /></Layout>} />
        <Route path="/client/:id" element={<Layout><ClientDetail /></Layout>} />
        <Route path="/upload" element={<Layout><UploadStatement /></Layout>} />
        <Route path="/review" element={<Layout><ReviewExtraction /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
};
