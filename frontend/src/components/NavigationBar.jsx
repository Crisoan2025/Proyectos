// ============================================================
// NavigationBar.jsx — Barra de navegación estilo NBA
// ============================================================
// Rediseñada para replicar la barra superior de nba.com:
// - Fondo negro puro con enlaces blancos en mayúscula
// - Logo/nombre a la izquierda
// - Links de navegación centrados
// - Botón de acción dorado (League Pass style) a la derecha
// ============================================================

import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';

const NavigationBar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-nba-black border-b border-nba-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
        {/* Logo / Marca */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="text-2xl">🏀</span>
          <span className="font-heading font-black text-xl tracking-widest text-nba-white">LIGA TPO</span>
        </Link>

        {/* Links centrales */}
        <div className="hidden md:flex gap-7">
          <Link to="/" className="text-xs font-semibold uppercase tracking-wider text-nba-lightgray hover:text-nba-white transition-colors py-4 border-b-2 border-transparent hover:border-nba-red">Inicio</Link>
          <Link to="/#standings" className="text-xs font-semibold uppercase tracking-wider text-nba-lightgray hover:text-nba-white transition-colors py-4 border-b-2 border-transparent hover:border-nba-red">Clasificación</Link>
          <Link to="/equipos" className="text-xs font-semibold uppercase tracking-wider text-nba-lightgray hover:text-nba-white transition-colors py-4 border-b-2 border-transparent hover:border-nba-red">Equipos</Link>
          <Link to="/jugadores" className="text-xs font-semibold uppercase tracking-wider text-nba-lightgray hover:text-nba-white transition-colors py-4 border-b-2 border-transparent hover:border-nba-red">Jugadores</Link>
        </div>

        {/* Acciones (derecha) */}
        <div className="flex items-center gap-2.5">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-xs font-bold uppercase tracking-wide px-4 py-2 rounded transition-all cursor-pointer bg-nba-gold text-nba-black hover:bg-[#ffb340] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(249,160,27,0.4)]">
                Pase de Liga
              </Link>
              <Link to="/login" className="text-xs font-bold uppercase tracking-wide px-4 py-2 rounded transition-all cursor-pointer border border-nba-gray text-nba-white hover:border-nba-white hover:bg-white/5">
                Iniciar sesión
              </Link>
            </>
          ) : (
            <>
              <Link to="/admin" className="text-xs font-bold uppercase tracking-wide px-4 py-2 rounded transition-all cursor-pointer bg-nba-gold text-nba-black hover:bg-[#ffb340] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(249,160,27,0.4)]">
                ⚙️ Panel VIP
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
