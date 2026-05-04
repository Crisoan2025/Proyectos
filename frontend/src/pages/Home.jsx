// ============================================================
// Home.jsx — Página principal estilo NBA
// ============================================================
// Layout de 2 columnas:
// - Izquierda (70%): Hero banner CSS-only + Tabla de posiciones
// - Derecha (30%): Sidebar de "Titulares" (datos mockeados)
// ============================================================

import { useEffect } from 'react';
import useApi from '../hooks/useApi';

// Datos estáticos de titulares (se reemplazarán por API en el futuro)
const TITULARES = [
  { id: 1, text: 'Toca para ver: Dónde encontrar todos los partidos de los playoffs' },
  { id: 2, text: 'Actualizaciones en vivo: Resultados de la Jornada 3' },
  { id: 3, text: 'El MVP de la temporada será anunciado esta semana' },
  { id: 4, text: 'Nuevas reglas de la liga para la próxima temporada' },
  { id: 5, text: 'Los mejores quintetos de la temporada regular 2026' },
  { id: 6, text: 'El draft de rookies: Jugadores elegibles confirmados' },
  { id: 7, text: 'Estadísticas: Los líderes en puntos, asistencias y rebotes' },
];

const Home = () => {
  const { data: equipos, loading, error, reload } = useApi('/equipos');

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div className="home">
      {/* ============ HERO BANNER (CSS-only, sin imagen) ============ */}
      <section className="hero">
        <div className="hero__overlay">
          <div className="hero__content">
            <span className="hero__badge">🏆 Temporada 2026</span>
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
              <span className="standings__season">Regular Season 2026</span>
            </div>

            {loading && <p className="loading-text">Cargando equipos...</p>}
            {error && <p className="error-text">❌ Error: {error}</p>}

            {!loading && !error && (
              <table className="standings-table">
                <thead>
                  <tr>
                    <th className="standings-table__rank">#</th>
                    <th className="standings-table__team">Equipo</th>
                    <th>PJ</th>
                    <th>W</th>
                    <th>L</th>
                    <th>E</th>
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
                      <td>{equipo.played}</td>
                      <td className="standings-table__win">{equipo.won}</td>
                      <td className="standings-table__loss">{equipo.lost}</td>
                      <td>{equipo.tied}</td>
                      <td className="standings-table__pts-cell">{equipo.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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