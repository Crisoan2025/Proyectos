// ============================================================
// Home.jsx — Página principal estilo NBA
// ============================================================
// Layout de 2 columnas:
// - Izquierda (70%): Hero banner + Selector de temporada/categoría + Standings
// - Derecha (30%): Sidebar de "Titulares"
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Datos estáticos de titulares (se reemplazarán por API en el futuro)
const TITULARES = [
  { id: 1, text: 'Toca para ver: Dónde encontrar todos los partidos de los playoffs' },
  { id: 2, text: 'Actualizaciones en vivo: Resultados de la Jornada 3' },
  { id: 3, text: 'El MVP de la temporada será anunciado esta semana' },
  { id: 4, text: 'Nuevas reglas de la liga para la próxima temporada' },
  { id: 5, text: 'Los mejores quintetos de la temporada regular' },
  { id: 6, text: 'El draft de rookies: Jugadores elegibles confirmados' },
  { id: 7, text: 'Estadísticas: Los líderes en puntos, asistencias y rebotes' },
];

const Home = () => {
  const [equipos, setEquipos] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [temporadaActiva, setTemporadaActiva] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar temporadas al montar
  useEffect(() => {
    const fetchTemporadas = async () => {
      try {
        const [resTodas, resActiva] = await Promise.all([
          api.get('/temporadas'),
          api.get('/temporadas/activa'),
        ]);
        const todas = await resTodas.json();
        setTemporadas(todas);

        if (resActiva.ok) {
          const activa = await resActiva.json();
          setTemporadaActiva(activa);
          setSelectedSeason(String(activa.id));
        }
      } catch (err) {
        console.error('Error cargando temporadas:', err);
      }
    };
    fetchTemporadas();
  }, []);

  // Cargar equipos cuando cambia la temporada o categoría seleccionada
  const cargarEquipos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedSeason) params.set('season_id', selectedSeason);
      if (categoryFilter) params.set('category', categoryFilter);
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const res = await api.get(`/equipos${queryString}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setEquipos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason, categoryFilter]);

  useEffect(() => {
    if (selectedSeason) cargarEquipos();
  }, [selectedSeason, categoryFilter, cargarEquipos]);

  // Nombre de la temporada seleccionada
  const selectedSeasonName = temporadas.find(t => String(t.id) === selectedSeason)?.name || 'Liga TPO';

  return (
    <div>
      {/* ============ HERO BANNER ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#1a0a2e] to-[#2a0a1e] before:absolute before:-top-1/2 before:-right-[20%] before:w-[600px] before:h-[600px] before:bg-[radial-gradient(circle,rgba(200,16,46,0.15)_0%,transparent_70%)] before:pointer-events-none after:absolute after:-bottom-[30%] after:-left-[10%] after:w-[500px] after:h-[500px] after:bg-[radial-gradient(circle,rgba(29,66,138,0.12)_0%,transparent_70%)] after:pointer-events-none">
        <div className="relative z-10 py-16 px-10 max-w-7xl mx-auto">
          <div className="max-w-[600px]">
            <span className="inline-block text-[0.7rem] font-bold uppercase tracking-[2px] text-nba-gold bg-nba-gold/10 border border-nba-gold/30 py-1.5 px-3.5 rounded mb-5">
              🏆 {temporadaActiva?.name || 'Liga de Baloncesto'}
            </span>
            <h2 className="font-heading text-5xl font-black leading-tight uppercase tracking-tight text-nba-white mb-4">
              LIGA DE BALONCESTO<br />
              <span className="text-nba-red block">TPO PLAYOFFS</span>
            </h2>
            <p className="text-base text-nba-lightgray leading-relaxed mb-7">
              Seguí la acción en vivo. Standings, fixture y resultados actualizados.
            </p>
            <div className="flex gap-3 flex-wrap">
              <a href="#standings" className="font-heading text-[0.8rem] font-bold uppercase tracking-[1.5px] py-3.5 px-7 rounded transition-all cursor-pointer border-none bg-nba-red text-nba-white hover:bg-[#e01535] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(200,16,46,0.35)]">
                VER CLASIFICACIÓN
              </a>
              <a href="#standings" className="font-heading text-[0.8rem] font-bold uppercase tracking-[1.5px] py-3.5 px-7 rounded transition-all cursor-pointer bg-transparent text-nba-white border border-white/30 hover:border-white hover:bg-white/5">
                FIXTURE COMPLETO
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTENIDO PRINCIPAL (2 columnas) ============ */}
      <div className="max-w-7xl mx-auto py-8 px-6 grid grid-cols-1 md:grid-cols-[1fr_340px] gap-8">

        {/* COLUMNA IZQUIERDA — Standings */}
        <main>
          <div className="bg-nba-card rounded-lg border border-nba-border overflow-hidden" id="standings">
            <div className="flex justify-between items-baseline pt-5 px-6 pb-4 border-b border-nba-border">
              <h2 className="font-heading text-xl font-black uppercase tracking-wide m-0 text-nba-white">Standings</h2>
              <div className="flex items-center gap-2">
                {/* Selector de temporada */}
                <select
                  className="py-1.5 px-3 text-[0.75rem] bg-nba-dark border border-nba-border rounded text-nba-lightgray cursor-pointer focus:outline-none focus:border-nba-blue focus:ring-2 focus:ring-nba-blue/25"
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                >
                  {temporadas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.is_active ? '(Activa)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabs de categoría */}
            <div className="flex items-center px-6 py-3 border-b border-nba-border gap-2 bg-nba-dark/50">
              {['', 'Senior', 'Junior'].map((cat) => (
                <button
                  key={cat}
                  className={`px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.8px] bg-transparent text-nba-gray border border-nba-border rounded cursor-pointer transition-all hover:text-nba-white hover:border-nba-gray ${categoryFilter === cat ? '!bg-nba-blue !text-nba-white !border-nba-blue' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat || 'Todos'}
                </button>
              ))}
              <span className="ml-auto text-[0.75rem] font-bold text-nba-gray uppercase tracking-wider">{selectedSeasonName}</span>
            </div>

            {loading && <p className="text-nba-blue font-semibold p-6 text-center">Cargando equipos...</p>}
            {error && <p className="text-nba-red font-semibold p-6 text-center">❌ Error: {error}</p>}

            {!loading && !error && (
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-nba-border">
                    <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest py-3 px-4 w-10">#</th>
                    <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest py-3 px-4 text-left">Equipo</th>
                    <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest py-3 px-4">CAT</th>
                    <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest py-3 px-4">PJ</th>
                    <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest py-3 px-4">W</th>
                    <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest py-3 px-4">L</th>
                    <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest py-3 px-4">E</th>
                    <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest py-3 px-4">DIF</th>
                    <th className="text-[0.7rem] font-semibold text-nba-gold uppercase tracking-widest py-3 px-4">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {equipos.map((equipo, index) => (
                    <tr key={equipo.id} className="transition-colors hover:bg-white/5 border-b border-nba-border/50">
                      <td className="py-3.5 px-4 text-nba-gray text-[0.8rem] font-bold">{index + 1}</td>
                      <td className="py-3.5 px-4 text-left font-bold text-nba-white uppercase text-[0.85rem] flex items-center gap-2.5">
                        <span className="text-lg">🏀</span>
                        {equipo.name}
                      </td>
                      <td className="py-3.5 px-4 text-[0.9rem] text-nba-lightgray">
                        <span className={`text-[0.65rem] font-bold uppercase tracking-[0.5px] py-1 px-2 rounded-sm inline-block ${equipo.category === 'Junior' ? 'bg-nba-green/20 text-nba-green' : 'bg-nba-blue/20 text-[#5b8def]'}`}>
                          {equipo.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[0.9rem] text-nba-lightgray">{equipo.played}</td>
                      <td className="py-3.5 px-4 text-[0.9rem] text-nba-green font-bold">{equipo.won}</td>
                      <td className="py-3.5 px-4 text-[0.9rem] text-nba-red font-bold">{equipo.lost}</td>
                      <td className="py-3.5 px-4 text-[0.9rem] text-nba-lightgray">{equipo.tied}</td>
                      <td className={`py-3.5 px-4 text-[0.9rem] ${equipo.goal_difference > 0 ? 'text-nba-green font-bold' : equipo.goal_difference < 0 ? 'text-nba-red' : 'text-nba-lightgray'}`}>
                        {equipo.goal_difference > 0 ? '+' : ''}{equipo.goal_difference}
                      </td>
                      <td className="py-3.5 px-4 font-black text-[1.1rem] text-nba-gold">{equipo.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && equipos.length === 0 && (
              <p className="text-center p-6 text-nba-gray">No hay equipos en esta categoría/temporada</p>
            )}
          </div>
        </main>

        {/* COLUMNA DERECHA — Titulares */}
        <aside>
          <div className="bg-nba-card rounded-lg border border-nba-border overflow-hidden">
            <div className="flex justify-between items-center pt-5 px-6 pb-4 border-b border-nba-border">
              <h3 className="font-heading text-lg font-black tracking-wide m-0 text-nba-white">TITULARES</h3>
              <span className="text-[0.75rem] text-nba-blue cursor-pointer hover:text-[#3a6ad4] transition-colors">Ver más</span>
            </div>
            <ul className="m-0 p-0 list-none">
              {TITULARES.map((noticia) => (
                <li key={noticia.id} className="border-b border-nba-border last:border-none hover:bg-white/5 transition-colors">
                  <a href="#" className="block py-4 px-6 text-[0.85rem] text-nba-lightgray leading-relaxed hover:text-nba-white transition-colors">{noticia.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;