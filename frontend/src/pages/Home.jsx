// ============================================================
// Home.jsx — Página pública de standings
// ============================================================
// POR QUÉ: Tenía la URL hardcodeada, estilos inline masivos
// y no mostraba estados de carga ni error.
// PARA QUÉ: Ahora usa el servicio centralizado (api.js),
// el custom hook (useApi) y clases CSS del design system.
// ============================================================

import { useEffect } from 'react';
import useApi from '../hooks/useApi';

const Home = () => {
  const { data: equipos, loading, error, reload } = useApi('/equipos');

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div className="home-container">
      <div className="standings-card">
        <div className="standings-header">
          <span className="standings-icon">🏆</span>
          <h2 className="standings-title">Standings - Regular Season 2026</h2>
        </div>
        
        <p className="standings-subtitle">
          Clasificación oficial de la liga basada en el desempeño de la temporada regular.
        </p>

        {/* Estado de carga */}
        {loading && <p className="loading-text">Cargando equipos...</p>}
        
        {/* Estado de error */}
        {error && <p className="error-text">❌ Error al cargar equipos: {error}</p>}

        {/* Tabla de standings */}
        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '40%' }}>Equipo</th>
                <th>PJ</th>
                <th>W</th>
                <th>L</th>
                <th className="th-highlight-gray">E</th>
                <th className="th-highlight-red">PTS</th>
              </tr>
            </thead>
            <tbody>
              {equipos.map((equipo, index) => (
                <tr key={equipo.id}>
                  <td className="team-name">
                    <span className="team-rank">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {equipo.name}
                  </td>
                  <td className="text-center">{equipo.played}</td>
                  <td className="text-center text-won">{equipo.won}</td>
                  <td className="text-center text-lost">{equipo.lost}</td>
                  <td className="text-center cell-alt">{equipo.tied}</td>
                  <td className="text-center cell-alt cell-points">{equipo.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Home;