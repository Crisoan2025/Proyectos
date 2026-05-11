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
    <div className="home">
      {/* ============ HERO BANNER ============ */}
      <section className="hero">
        <div className="hero__overlay">
          <div className="hero__content">
            <span className="hero__badge">🏆 {temporadaActiva?.name || 'Liga de Baloncesto'}</span>
            <h2 className="hero__title">
              LIGA DE BALONCESTO<br />
              <span className="hero__title--accent">TPO PLAYOFFS</span>
            </h2>
            <p className="hero__subtitle">
              Seguí la acción en vivo. Standings, fixture y resultados actualizados.
            </p>
            <div className="hero__buttons">
              <a href="#standings" className="hero__btn hero__btn--primary">VER CLASIFICACIÓN</a>
              <a href="#standings" className="hero__btn hero__btn--outline">FIXTURE COMPLETO</a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTENIDO PRINCIPAL (2 columnas) ============ */}
      <div className="home__grid">

        {/* COLUMNA IZQUIERDA — Standings */}
        <main className="home__main">
          <div className="standings" id="standings">
            <div className="standings__header">
              <h2 className="standings__title">Standings</h2>
              <div className="standings__controls">
                {/* Selector de temporada */}
                <select
                  className="standings__select"
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
            <div className="standings__tabs">
              {['', 'Senior', 'Junior'].map((cat) => (
                <button
                  key={cat}
                  className={`category-tab ${categoryFilter === cat ? 'category-tab--active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat || 'Todos'}
                </button>
              ))}
              <span className="standings__season-label">{selectedSeasonName}</span>
            </div>

            {loading && <p className="loading-text">Cargando equipos...</p>}
            {error && <p className="error-text">❌ Error: {error}</p>}

            {!loading && !error && (
              <table className="standings-table">
                <thead>
                  <tr>
                    <th className="standings-table__rank">#</th>
                    <th className="standings-table__team">Equipo</th>
                    <th>CAT</th>
                    <th>PJ</th>
                    <th>W</th>
                    <th>L</th>
                    <th>E</th>
                    <th>DIF</th>
                    <th className="standings-table__pts">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {equipos.map((equipo, index) => (
                    <tr key={equipo.id} className="standings-table__row">
                      <td className="standings-table__rank-cell">{index + 1}</td>
                      <td className="standings-table__team-cell">
                        <span className="standings-table__team-icon">🏀</span>
                        {equipo.name}
                      </td>
                      <td>
                        <span className={`category-badge ${equipo.category === 'Junior' ? 'category-badge--junior' : 'category-badge--senior'}`}>
                          {equipo.category}
                        </span>
                      </td>
                      <td>{equipo.played}</td>
                      <td className="standings-table__win">{equipo.won}</td>
                      <td className="standings-table__loss">{equipo.lost}</td>
                      <td>{equipo.tied}</td>
                      <td className={equipo.goal_difference > 0 ? 'text-won' : equipo.goal_difference < 0 ? 'text-lost' : ''}>
                        {equipo.goal_difference > 0 ? '+' : ''}{equipo.goal_difference}
                      </td>
                      <td className="standings-table__pts-cell">{equipo.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && equipos.length === 0 && (
              <p className="empty-state">No hay equipos en esta categoría/temporada</p>
            )}
          </div>
        </main>

        {/* COLUMNA DERECHA — Titulares */}
        <aside className="home__sidebar">
          <div className="titulares">
            <div className="titulares__header">
              <h3 className="titulares__title">TITULARES</h3>
              <span className="titulares__ver-mas">Ver más</span>
            </div>
            <ul className="titulares__list">
              {TITULARES.map((noticia) => (
                <li key={noticia.id} className="titulares__item">
                  <a href="#" className="titulares__link">{noticia.text}</a>
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