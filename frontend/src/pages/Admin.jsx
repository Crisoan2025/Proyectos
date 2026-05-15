// ============================================================
// Admin.jsx — Panel de Administración (Ensamblador)
// ============================================================
// POR QUÉ: Antes era un "God Component" de 360 líneas.
// PARA QUÉ: Ahora es un componente "delgado" que ensambla
// sub-componentes, coordina datos y gestiona temporadas.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import api from '../services/api';
import { useTeams } from '../features/teams/api/useTeams';
import { useMatches } from '../features/matches/api/useMatches';
import { usePlayers } from '../features/players/api/usePlayers';
import TeamForm from '../features/teams/components/TeamForm';
import MatchForm from '../features/matches/components/MatchForm';
import PlayerForm from '../features/players/components/PlayerForm';
import PlayerTable from '../features/players/components/PlayerTable';
import MatchTable from '../features/matches/components/MatchTable';

const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const matchFormRef = useRef(null);

  // Custom hooks para cargar datos desde las features
  const { teams: equipos, reload: reloadEquipos } = useTeams();
  const { matches: partidos, reload: reloadPartidos } = useMatches();
  const { players: jugadores, reload: reloadJugadores } = usePlayers();

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
    <div className="max-w-7xl mx-auto p-6">
      {/* CABECERA */}
      <div className="flex justify-between items-center bg-nba-card py-4 px-6 rounded-lg border border-nba-border border-l-4 border-l-nba-red">
        <div className="flex items-center gap-4">
          <h2 className="m-0 font-heading text-xl font-black tracking-wide text-nba-white">⚙️ PANEL VIP</h2>
          {temporadaActiva && (
            <span className="text-[0.8rem] font-bold uppercase tracking-wider text-nba-gold bg-nba-gold/10 px-2 py-1 rounded border border-nba-gold/30">
              📅 {temporadaActiva.name}
            </span>
          )}
        </div>
        <button onClick={handleLogout} className="font-body font-bold text-[0.8rem] uppercase tracking-[0.8px] py-2.5 px-4 rounded border-none cursor-pointer text-white transition-all bg-[#d32f2f] hover:-translate-y-px">
          🚪 CERRAR SESIÓN
        </button>
      </div>

      {/* SECCIÓN TEMPORADAS */}
      <div className="mt-6">
        <div className="bg-nba-card p-6 rounded-lg border border-nba-border flex-1 min-w-[300px]">
          <h3 className="font-heading text-base font-bold tracking-wide m-0 mb-4 pb-2.5 border-b-2 border-nba-green text-nba-white block">📅 GESTIÓN DE TEMPORADA</h3>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-nba-gray font-bold text-[0.8rem] uppercase tracking-wider">Temporada activa:</span>
              <span className="text-nba-white font-bold text-[0.9rem]">{temporadaActiva?.name || 'Sin temporada'}</span>
            </div>
          </div>
          <form onSubmit={handleCrearTemporada} className="flex flex-col gap-2.5 mt-3">
            <input
              type="text"
              placeholder="Nombre de nueva temporada (ej: Temporada 2027)"
              value={nuevaTemporada}
              onChange={(e) => setNuevaTemporada(e.target.value)}
              required
              className="bg-nba-dark border border-nba-border rounded px-3 py-3 text-[0.9rem] text-nba-white font-body transition-all focus:outline-none focus:border-nba-blue focus:ring-4 focus:ring-nba-blue/20 placeholder-nba-gray"
            />
            <button type="submit" className="font-body font-bold text-[0.8rem] uppercase tracking-[0.8px] py-3 px-4 rounded border-none cursor-pointer text-white transition-all bg-nba-green hover:shadow-[0_4px_14px_rgba(0,166,81,0.4)] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" disabled={creandoTemporada}>
              {creandoTemporada ? 'CREANDO...' : '🆕 CREAR NUEVA TEMPORADA'}
            </button>
          </form>
          <p className="text-[0.75rem] text-nba-gray mt-2">
            ⚠️ Al crear una nueva temporada, las estadísticas se reinician a 0 para todos los equipos.
          </p>
        </div>
      </div>

      {/* FILA DE FORMULARIOS */}
      <div className="flex gap-4 mt-5 flex-wrap items-start">
        <TeamForm onTeamCreated={reloadEquipos} />
        <MatchForm ref={matchFormRef} equipos={equipos} onMatchSaved={handleMatchUpdated} />
        <PlayerForm equipos={equipos} onPlayerCreated={reloadJugadores} />
      </div>

      {/* FILA DE TABLAS */}
      <div className="flex gap-4 mt-6 flex-wrap items-start">
        <PlayerTable jugadores={jugadores} onPlayerDeleted={reloadJugadores} />
        <MatchTable partidos={partidos} onMatchUpdated={handleMatchUpdated} onEditMatch={handleEditMatch} />
      </div>
    </div>
  );
};

export default Admin;