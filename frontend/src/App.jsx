import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import NavigationBar from './components/NavigationBar';
import ScoreboardRibbon from './features/matches/components/ScoreboardRibbon';
import Home from './pages/Home';
import Equipos from './pages/Equipos';
import Jugadores from './pages/Jugadores';
import Login from './features/auth/pages/Login';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const Layout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
      </Routes>
    );
  }

  return (
    <>
      <NavigationBar />
      <ScoreboardRibbon />
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
        <Router>
          <Layout />
        </Router>
        <Toaster theme="dark" richColors closeButton />
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
