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
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarDays, PlusCircle, Menu } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '../features/admin/components/AdminSidebar';

const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const matchFormRef = useRef(null);

  const { teams: equipos, reload: reloadEquipos } = useTeams();
  const { matches: partidos, reload: reloadPartidos } = useMatches();
  const { players: jugadores, reload: reloadJugadores } = usePlayers();

  const [temporadaActiva, setTemporadaActiva] = useState(null);
  const [nuevaTemporada, setNuevaTemporada] = useState('');
  const [creandoTemporada, setCreandoTemporada] = useState(false);
  const [activeSection, setActiveSection] = useState('partidos');

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
        toast.success(data.message);
        setNuevaTemporada('');
        fetchTemporadaActiva();
        reloadEquipos();
        reloadPartidos();
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al crear temporada');
    } finally {
      setCreandoTemporada(false);
    }
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

  // Renderizar la sección activa
  const renderContent = () => {
    switch (activeSection) {
      case 'partidos':
        return (
          <div className="flex gap-4 flex-wrap xl:flex-nowrap items-start">
            <MatchForm ref={matchFormRef} equipos={equipos} onMatchSaved={handleMatchUpdated} />
            <MatchTable partidos={partidos} onMatchUpdated={handleMatchUpdated} onEditMatch={handleEditMatch} />
          </div>
        );
      case 'jugadores':
        return (
          <div className="flex gap-4 flex-wrap xl:flex-nowrap items-start">
            <PlayerForm equipos={equipos} onPlayerCreated={reloadJugadores} />
            <PlayerTable jugadores={jugadores} onPlayerDeleted={reloadJugadores} />
          </div>
        );
      case 'equipos':
        return (
          <div className="flex justify-center">
            <div className="max-w-2xl w-full">
              <TeamForm onTeamCreated={reloadEquipos} />
            </div>
          </div>
        );
      case 'temporadas':
        return (
          <div className="flex justify-center">
            <div className="max-w-2xl w-full bg-nba-card p-6 rounded-lg border border-nba-border">
              <div className="flex items-center gap-2 mb-4 pb-2.5 border-b-2 border-nba-green">
                <CalendarDays className="w-5 h-5 text-nba-green" />
                <h3 className="font-heading text-base font-bold tracking-wide m-0 text-nba-white block">GESTIÓN DE TEMPORADA</h3>
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-nba-gray font-bold text-[0.8rem] uppercase tracking-wider">Temporada activa:</span>
                  <span className="text-nba-white font-bold text-[0.9rem]">{temporadaActiva?.name || 'Sin temporada'}</span>
                </div>
              </div>
              <form onSubmit={handleCrearTemporada} className="flex flex-col gap-2.5 mt-3">
                <Input
                  type="text"
                  placeholder="Nombre de nueva temporada (ej: Temporada 2027)"
                  value={nuevaTemporada}
                  onChange={(e) => setNuevaTemporada(e.target.value)}
                  required
                  className="bg-nba-dark border-nba-border text-nba-white placeholder:text-nba-gray"
                />
                <Button type="submit" disabled={creandoTemporada} className="bg-nba-green hover:bg-nba-green/90 text-white font-body font-bold text-[0.8rem] uppercase tracking-[0.8px] flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  {creandoTemporada ? 'CREANDO...' : 'CREAR NUEVA TEMPORADA'}
                </Button>
              </form>
              <p className="text-[0.75rem] text-nba-gray mt-2">
                ⚠️ Al crear una nueva temporada, las estadísticas se reinician a 0 para todos los equipos.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="dark flex h-screen overflow-hidden w-full bg-nba-dark text-nba-white">
        <AdminSidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          temporadaActiva={temporadaActiva} 
        />
        
        <div className="flex-1 overflow-y-auto w-full">
          {/* Header Superior del Contenido */}
          <header className="flex h-14 items-center gap-4 border-b border-nba-border bg-nba-card px-6 lg:h-[60px]">
            <SidebarTrigger className="text-nba-white hover:text-white" />
            <h1 className="font-heading font-black text-lg text-nba-white uppercase tracking-wide">
              {activeSection === 'partidos' && 'Fixture y Programación'}
              {activeSection === 'jugadores' && 'Gestión de Roster'}
              {activeSection === 'equipos' && 'Inscripción de Equipos'}
              {activeSection === 'temporadas' && 'Configuración de Campeonato'}
            </h1>
          </header>

          {/* Área Principal de Trabajo */}
          <main className="p-6 md:p-8 max-w-[1600px] mx-auto w-full">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;