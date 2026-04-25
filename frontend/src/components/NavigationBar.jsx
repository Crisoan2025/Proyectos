// ============================================================
// NavigationBar.jsx — Barra de navegación principal
// ============================================================
// POR QUÉ: Estaba embebida dentro de App.jsx, mezclando la
// responsabilidad de enrutamiento con la de navegación visual.
// PARA QUÉ: Componente independiente que consume AuthContext
// para mostrar "Acceso Admin" o "Panel VIP" según el estado
// de autenticación, sin leer localStorage directamente.
// ============================================================

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavigationBar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="main-nav">
      <Link to="/" className="nav-link">
        🏠 Inicio
      </Link>
      
      {!isAuthenticated ? (
        <Link to="/login" className="nav-link">
          🔑 Acceso Admin
        </Link>
      ) : (
        <Link to="/admin" className="nav-link">
          ⚙️ Panel VIP
        </Link>
      )}
    </nav>
  );
};

export default NavigationBar;
