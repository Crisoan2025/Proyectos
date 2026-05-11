// ============================================================
// Equipos.jsx — Página pública de equipos
// ============================================================
// POR QUÉ: Los usuarios comunes no tenían forma de ver los
// equipos fuera del panel de admin. El link del navbar no iba
// a ningún lado.
// PARA QUÉ: Muestra todos los equipos con sus stats y al hacer
// click expande el roster (jugadores) de cada equipo.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const Equipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [equipoDetalle, setEquipoDetalle] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const cargarEquipos = useCallback(async () => {
    setLoading(true);
    try {
      const params = categoryFilter ? `?category=${categoryFilter}` : '';
      const res = await api.get(`/equipos${params}`);
      const data = await res.json();
      setEquipos(data);
    } catch (err) {
      console.error('Error cargando equipos:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    cargarEquipos();
  }, [cargarEquipos]);

  const verDetalle = async (id) => {
    if (equipoDetalle?.id === id) {
      setEquipoDetalle(null);
      return;
    }
    try {
      const res = await api.get(`/equipos/${id}`);
      const data = await res.json();
      setEquipoDetalle(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="public-page">
      <div className="public-page__header">
        <h2 className="public-page__title">🏀 Equipos de la Liga</h2>
        <div className="category-tabs">
          {['', 'Senior', 'Junior'].map((cat) => (
            <button
              key={cat}
              className={`category-tab ${categoryFilter === cat ? 'category-tab--active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat || 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="loading-text">Cargando equipos...</p>}

      <div className="teams-grid">
        {equipos.map((equipo) => (
          <div key={equipo.id} className="team-card" onClick={() => verDetalle(equipo.id)}>
            <div className="team-card__header">
              <span className="team-card__icon">🏀</span>
              <div>
                <h3 className="team-card__name">{equipo.name}</h3>
                <span className="team-card__category">{equipo.category}</span>
              </div>
            </div>
            <div className="team-card__coach">
              <span className="team-card__label">DT:</span> {equipo.coach_name}
            </div>
            <div className="team-card__stats">
              <div className="team-card__stat">
                <span className="team-card__stat-value team-card__stat-value--pts">{equipo.points}</span>
                <span className="team-card__stat-label">PTS</span>
              </div>
              <div className="team-card__stat">
                <span className="team-card__stat-value team-card__stat-value--win">{equipo.won}</span>
                <span className="team-card__stat-label">W</span>
              </div>
              <div className="team-card__stat">
                <span className="team-card__stat-value team-card__stat-value--loss">{equipo.lost}</span>
                <span className="team-card__stat-label">L</span>
              </div>
              <div className="team-card__stat">
                <span className="team-card__stat-value">{equipo.played}</span>
                <span className="team-card__stat-label">PJ</span>
              </div>
            </div>

            {/* Detalle expandido con roster */}
            {equipoDetalle?.id === equipo.id && (
              <div className="team-card__roster">
                <h4 className="team-card__roster-title">📋 Roster ({equipoDetalle.jugadores?.length || 0} jugadores)</h4>
                {equipoDetalle.jugadores && equipoDetalle.jugadores.length > 0 ? (
                  <ul className="team-card__roster-list">
                    {equipoDetalle.jugadores.map((j) => (
                      <li key={j.id} className="team-card__player">
                        <span className="team-card__player-name">{j.surname}, {j.name}</span>
                        <span className="team-card__player-cat">{j.category}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-state">Sin jugadores registrados</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && equipos.length === 0 && (
        <p className="empty-state">No se encontraron equipos para esta categoría</p>
      )}
    </div>
  );
};

export default Equipos;
