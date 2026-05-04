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
import { useAuth } from '../context/AuthContext';

const NavigationBar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Logo / Marca */}
        <Link to="/" className="navbar__brand">
          <span className="navbar__logo">🏀</span>
          <span className="navbar__brand-text">LIGA TPO</span>
        </Link>

        {/* Links centrales */}
        <div className="navbar__links">
          <Link to="/" className="navbar__link">Inicio</Link>
          <Link to="/" className="navbar__link">Clasificación</Link>
          <Link to="/" className="navbar__link">Equipos</Link>
          <Link to="/" className="navbar__link">Jugadores</Link>
        </div>

        {/* Acciones (derecha) */}
        <div className="navbar__actions">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="navbar__btn navbar__btn--gold">
                Pase de Liga
              </Link>
              <Link to="/login" className="navbar__btn navbar__btn--outline">
                Iniciar sesión
              </Link>
            </>
          ) : (
            <>
              <Link to="/admin" className="navbar__btn navbar__btn--gold">
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
