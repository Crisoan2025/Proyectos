import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import NavigationBar from './components/NavigationBar';
import ScoreboardRibbon from './features/matches/components/ScoreboardRibbon';
import Home from './pages/Home';
import Equipos from './pages/Equipos';
import Jugadores from './pages/Jugadores';
import Login from './features/auth/pages/Login';
import Admin from './pages/Admin';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavigationBar />
        <ScoreboardRibbon />

        <div className="text-center p-0">
          <h1 className="hidden">Liga de Baloncesto TPO</h1>
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/equipos" element={<Equipos />} />
            <Route path="/jugadores" element={<Jugadores />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </Router>
      <Toaster theme="dark" richColors closeButton />
    </AuthProvider>
  );
}

export default App;
