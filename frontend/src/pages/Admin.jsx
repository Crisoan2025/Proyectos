// ============================================================
// Admin.jsx — Panel de Administración (Ensamblador)
// ============================================================
// POR QUÉ: Antes era un "God Component" de 360 líneas.
// PARA QUÉ: Ahora es un componente "delgado" que ensambla
// sub-componentes, coordina datos y gestiona temporadas.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import api from '../services/api';
import TeamForm from '../components/TeamForm';
import MatchForm from '../components/MatchForm';
import PlayerForm from '../components/PlayerForm';
import PlayerTable from '../components/PlayerTable';
import MatchTable from '../components/MatchTable';

const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const matchFormRef = useRef(null);

  // Custom hooks para cargar datos
  const { data: equipos, reload: reloadEquipos } = useApi('/equipos');
  const { data: partidos, reload: reloadPartidos } = useApi('/partidos');
  const { data: jugadores, reload: reloadJugadores } = useApi('/jugadores');

  // Estado para temporadas
  const [temporadaActiva, setTemporadaActiva] = useState(null);
  const [nuevaTemporada, setNuevaTemporada] = useState('');
  const [creandoTemporada, setCreandoTemporada] = useState(false);

  // Carga inicial: verificar auth y cargar todo EN PARALELO
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    Promise.all([reloadEquipos(), reloadPartidos(), reloadJugadores()]);
    fetchTemporadaActiva();
  }, [isAuthenticated, navigate, reloadEquipos, reloadPartidos, reloadJugadores]);

  const fetchTemporadaActiva = async () => {
    try {
      const res = await api.get('/temporadas/activa');
      if (res.ok) {
        const data = await res.json();
        setTemporadaActiva(data);
      }
    } catch (err) {
      console.error('Error cargando temporada activa:', err);
    }
  };

  const handleCrearTemporada = async (e) => {
    e.preventDefault();
    if (!nuevaTemporada.trim()) return;

    setCreandoTemporada(true);
    try {
      const res = await api.post('/temporadas', { name: nuevaTemporada }, true);
      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setNuevaTemporada('');
        fetchTemporadaActiva();
        // Recargar equipos porque las stats se reiniciaron
        reloadEquipos();
        reloadPartidos();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreandoTemporada(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMatchUpdated = () => {
    reloadPartidos();
    reloadEquipos();
  };

  const handleEditMatch = (partido) => {
    if (matchFormRef.current) {
      matchFormRef.current.iniciarEdicion(partido);
    }
  };

  return (
    <div className="admin-container">
      {/* CABECERA */}
      <div className="admin-header">
        <div className="admin-header__left">
          <h2 className="admin-header__title">⚙️ PANEL VIP</h2>
          {temporadaActiva && (
            <span className="admin-header__season">
              📅 {temporadaActiva.name}
            </span>
          )}
        </div>
        <button onClick={handleLogout} className="btn btn-danger">
          🚪 CERRAR SESIÓN
        </button>
      </div>

      {/* SECCIÓN TEMPORADAS */}
      <div className="admin-season-section">
        <div className="card">
          <h3 className="card-title card-title--green">📅 GESTIÓN DE TEMPORADA</h3>
          <div className="season-info">
            <div className="season-info__current">
              <span className="season-info__label">Temporada activa:</span>
              <span className="season-info__value">{temporadaActiva?.name || 'Sin temporada'}</span>
            </div>
          </div>
          <form onSubmit={handleCrearTemporada} className="admin-form" style={{ marginTop: '12px' }}>
            <input
              type="text"
              placeholder="Nombre de nueva temporada (ej: Temporada 2027)"
              value={nuevaTemporada}
              onChange={(e) => setNuevaTemporada(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-green" disabled={creandoTemporada}>
              {creandoTemporada ? 'CREANDO...' : '🆕 CREAR NUEVA TEMPORADA'}
            </button>
          </form>
          <p className="text-small text-muted" style={{ marginTop: '8px' }}>
            ⚠️ Al crear una nueva temporada, las estadísticas se reinician a 0 para todos los equipos.
          </p>
        </div>
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