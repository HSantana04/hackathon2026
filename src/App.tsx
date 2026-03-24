import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { ClientDetail } from './pages/ClientDetail';
import { UploadStatement } from './pages/UploadStatement';
import { ReviewExtraction } from './pages/ReviewExtraction';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/client/:id" element={<ClientDetail />} />
          <Route path="/upload" element={<UploadStatement />} />
          <Route path="/review" element={<ReviewExtraction />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
