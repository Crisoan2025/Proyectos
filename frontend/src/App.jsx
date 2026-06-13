import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { SettingsProvider } from './features/settings/SettingsContext';
import NavigationBar from './components/NavigationBar';
import ScoreboardRibbon from './features/matches/components/ScoreboardRibbon';
import Home from './pages/Home';
import Equipos from './pages/Equipos';
import Jugadores from './pages/Jugadores';
import Login from './features/auth/pages/Login';
import Admin from './pages/Admin';
import PartidosSection from './pages/admin/PartidosSection';
import JugadoresSection from './pages/admin/JugadoresSection';
import EquiposSection from './pages/admin/EquiposSection';
import TemporadasSection from './pages/admin/TemporadasSection';
import LigaSection from './pages/admin/LigaSection';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const Layout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  // 🔧 CORRECCIÓN: detectamos la pantalla de login para no mostrarle la cinta
  // de partidos (ScoreboardRibbon), que rompía la estética del formulario.
  const isLogin = location.pathname === '/login';

  if (isAdmin) {
    return (
      <Routes>
        {/* Admin = layout con rutas anidadas. Cada sección es su propia URL. */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="partidos" replace />} />
          <Route path="partidos" element={<PartidosSection />} />
          <Route path="jugadores" element={<JugadoresSection />} />
          <Route path="equipos" element={<EquiposSection />} />
          <Route path="temporadas" element={<TemporadasSection />} />
          <Route path="liga" element={<LigaSection />} />
          {/* Sub-ruta desconocida -> volver a Partidos.
              Ruta ABSOLUTA a propósito: una relativa se concatenaría sobre la
              ruta basura y entraría en un loop (/admin/xxx/partidos/partidos/...). */}
          <Route path="*" element={<Navigate to="/admin/partidos" replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <>
      <NavigationBar />
      {/* 🔧 CORRECCIÓN: la cinta de partidos NO se muestra en /login. */}
      {!isLogin && <ScoreboardRibbon />}
      <div className="text-center p-0">
        <h1 className="hidden">Liga de Baloncesto TPO</h1>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/equipos" element={<Equipos />} />
          <Route path="/jugadores" element={<Jugadores />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <TooltipProvider delayDuration={0}>
      <AuthProvider>
        <SettingsProvider>
          <Router>
            <Layout />
          </Router>
          <Toaster theme="dark" richColors closeButton />
        </SettingsProvider>
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
