import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/auth';
import api from './lib/api';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { MandantenPage } from './pages/Mandanten';
import { MandantDetailPage } from './pages/MandantDetail';
import { DossiersPage } from './pages/Dossiers';
import { DossierDetailPage } from './pages/DossierDetail';
import { LeistungenPage } from './pages/Leistungen';
import { RechnungenPage } from './pages/Rechnungen';
import { DokumentePage } from './pages/Dokumente';
import { KIAssistentPage } from './pages/KIAssistent';
import { PaketePage } from './pages/Pakete';
import { DatenschutzPage } from './pages/legal/Datenschutz';
import { AGBPage } from './pages/legal/AGB';
import { SicherheitPage } from './pages/legal/Sicherheit';
import { ImpressumPage } from './pages/legal/Impressum';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(!user && !!token);

  useEffect(() => {
    if (token && !user) {
      api.get('/auth/me')
        .then(r => setAuth(r.data, token))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#185FA5] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/mandanten" element={<ProtectedRoute><MandantenPage /></ProtectedRoute>} />
        <Route path="/mandanten/:id" element={<ProtectedRoute><MandantDetailPage /></ProtectedRoute>} />
        <Route path="/dossiers" element={<ProtectedRoute><DossiersPage /></ProtectedRoute>} />
        <Route path="/dossiers/:id" element={<ProtectedRoute><DossierDetailPage /></ProtectedRoute>} />
        <Route path="/leistungen" element={<ProtectedRoute><LeistungenPage /></ProtectedRoute>} />
        <Route path="/rechnungen" element={<ProtectedRoute><RechnungenPage /></ProtectedRoute>} />
        <Route path="/dokumente" element={<ProtectedRoute><DokumentePage /></ProtectedRoute>} />
        <Route path="/ki-assistent" element={<ProtectedRoute><KIAssistentPage /></ProtectedRoute>} />
        <Route path="/pakete" element={<ProtectedRoute><PaketePage /></ProtectedRoute>} />
        <Route path="/datenschutz" element={<ProtectedRoute><DatenschutzPage /></ProtectedRoute>} />
        <Route path="/agb" element={<ProtectedRoute><AGBPage /></ProtectedRoute>} />
        <Route path="/sicherheit" element={<ProtectedRoute><SicherheitPage /></ProtectedRoute>} />
        <Route path="/impressum" element={<ProtectedRoute><ImpressumPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
