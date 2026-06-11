// ============================================================
// Admin.jsx — Layout del panel de administración
// ============================================================
// 🔧 REFACTOR: antes la navegación entre secciones era por estado local
// (activeSection) y la URL siempre quedaba en /admin (recargar volvía a
// "Partidos"). Ahora cada sección es una RUTA real (/admin/partidos,
// /admin/jugadores, /admin/equipos, /admin/temporadas):
// - Recargar mantiene la sección y los links son compartibles.
// - Atrás/Adelante del navegador funcionan entre secciones.
// Este componente es el LAYOUT: carga la data compartida una sola vez y la
// reparte a las secciones hijas vía <Outlet context={...}>.
// ============================================================

import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useTeams } from '../features/teams/api/useTeams';
import { useMatches } from '../features/matches/api/useMatches';
import { usePlayers } from '../features/players/api/usePlayers';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '../features/admin/components/AdminSidebar';

// Título del header según la sub-ruta activa.
const SECTION_TITLES = {
  partidos: 'Fixture y Programación',
  jugadores: 'Gestión de Roster',
  equipos: 'Inscripción de Equipos',
  temporadas: 'Configuración de Campeonato',
};

const Admin = () => {
  const { teams: equipos, reload: reloadEquipos } = useTeams();
  const { matches: partidos, reload: reloadPartidos } = useMatches();
  const { players: jugadores, reload: reloadJugadores } = usePlayers();
  const [temporadaActiva, setTemporadaActiva] = useState(null);

  const location = useLocation();
  // /admin/equipos -> "equipos" (default "partidos")
  const section = location.pathname.split('/')[2] || 'partidos';

  useEffect(() => {
    Promise.all([reloadEquipos(), reloadPartidos(), reloadJugadores()]);
    fetchTemporadaActiva();
  }, [reloadEquipos, reloadPartidos, reloadJugadores]);

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

  // Data + acciones compartidas que consumen las secciones (useOutletContext).
  const outletContext = {
    equipos,
    partidos,
    jugadores,
    reloadEquipos,
    reloadPartidos,
    reloadJugadores,
    temporadaActiva,
    fetchTemporadaActiva,
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="dark flex h-screen overflow-hidden w-full bg-nba-dark text-nba-white">
        <AdminSidebar temporadaActiva={temporadaActiva} />

        <div className="flex-1 overflow-y-auto w-full">
          {/* Header Superior del Contenido */}
          <header className="flex h-14 items-center gap-4 border-b border-nba-border bg-nba-card px-6 lg:h-[60px]">
            <SidebarTrigger className="text-nba-white hover:text-white" />
            <h1 className="font-heading font-black text-lg text-nba-white uppercase tracking-wide">
              {SECTION_TITLES[section] || 'Panel de Administración'}
            </h1>
          </header>

          {/* Área Principal de Trabajo — la sección activa la renderiza el router */}
          <main className="p-6 md:p-8 max-w-[1600px] mx-auto w-full">
            <Outlet context={outletContext} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
