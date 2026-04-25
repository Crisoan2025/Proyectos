// ============================================================
// Admin.jsx — Panel de Administración (Ensamblador)
// ============================================================
// POR QUÉ: Antes era un "God Component" de 360 líneas con 17
// estados y 9 funciones. Imposible de mantener y testear.
// PARA QUÉ: Ahora es un componente "delgado" que solo ensambla
// sub-componentes y coordina la carga de datos en paralelo.
// Regla react-best-practices: async-parallel (Promise.all)
// ============================================================

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import TeamForm from '../components/TeamForm';
import MatchForm from '../components/MatchForm';
import PlayerForm from '../components/PlayerForm';
import PlayerTable from '../components/PlayerTable';
import MatchTable from '../components/MatchTable';

const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const matchFormRef = useRef(null);

  // Custom hooks para cargar datos (cada uno maneja su loading/error)
  const { data: equipos, reload: reloadEquipos } = useApi('/equipos');
  const { data: partidos, reload: reloadPartidos } = useApi('/partidos');
  const { data: jugadores, reload: reloadJugadores } = useApi('/jugadores');

  // Carga inicial: verificar auth y cargar todo EN PARALELO
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Regla async-parallel: ejecutar las 3 peticiones al mismo tiempo
    Promise.all([reloadEquipos(), reloadPartidos(), reloadJugadores()]);
  }, [isAuthenticated, navigate, reloadEquipos, reloadPartidos, reloadJugadores]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Cuando se actualiza un partido, también recargamos equipos (por standings)
  const handleMatchUpdated = () => {
    reloadPartidos();
    reloadEquipos();
  };

  // Callback para que MatchTable le avise a MatchForm que edite un partido
  const handleEditMatch = (partido) => {
    if (matchFormRef.current) {
      matchFormRef.current.iniciarEdicion(partido);
    }
  };

  return (
    <div className="admin-container">
      {/* CABECERA */}
      <div className="admin-header">
        <h2 className="admin-header__title">⚙️ PANEL VIP</h2>
        <button onClick={handleLogout} className="btn btn-danger">
          🚪 CERRAR SESIÓN
        </button>
      </div>

      {/* FILA DE FORMULARIOS */}
      <div className="admin-forms-row">
        <TeamForm onTeamCreated={reloadEquipos} />
        <MatchForm ref={matchFormRef} equipos={equipos} onMatchSaved={handleMatchUpdated} />
        <PlayerForm equipos={equipos} onPlayerCreated={reloadJugadores} />
      </div>

      {/* FILA DE TABLAS */}
      <div className="admin-tables-row">
        <PlayerTable jugadores={jugadores} onPlayerDeleted={reloadJugadores} />
        <MatchTable partidos={partidos} onMatchUpdated={handleMatchUpdated} onEditMatch={handleEditMatch} />
      </div>
    </div>
  );
};

export default Admin;