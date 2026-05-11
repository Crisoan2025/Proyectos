// ============================================================
// Jugadores.jsx — Página pública de jugadores
// ============================================================
// POR QUÉ: No existía una vista pública para ver los jugadores.
// PARA QUÉ: Lista todos los jugadores con búsqueda por nombre
// y filtro por categoría. Visible para cualquier usuario.
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { usePlayers } from '../features/players/api/usePlayers';

const Jugadores = () => {
  const { players: jugadores, loading, error, reload } = usePlayers();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    reload();
  }, [reload]);

  // useMemo para no recalcular el filtro en cada render
  const jugadoresFiltrados = useMemo(() => {
    return jugadores.filter((j) => {
      const matchesSearch = `${j.name} ${j.surname}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || j.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [jugadores, searchTerm, categoryFilter]);

  return (
    <div className="public-page">
      <div className="public-page__header">
        <h2 className="public-page__title">🏃‍♂️ Jugadores de la Liga</h2>
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

      {/* Barra de búsqueda */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Buscar jugador por nombre o apellido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar__input"
        />
        <span className="search-bar__count">
          {jugadoresFiltrados.length} jugador{jugadoresFiltrados.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {loading && <p className="loading-text">Cargando jugadores...</p>}
      {error && <p className="error-text">❌ Error: {error}</p>}

      {!loading && !error && (
        <div className="players-grid">
          {jugadoresFiltrados.map((j) => (
            <div key={j.id} className="player-card">
              <div className="player-card__avatar">
                {j.surname?.charAt(0)}{j.name?.charAt(0)}
              </div>
              <div className="player-card__info">
                <h3 className="player-card__name">{j.surname}, {j.name}</h3>
                <span className="player-card__team">
                  {j.team_name || 'Agente Libre'}
                </span>
              </div>
              <span className={`player-card__badge ${j.category === 'Junior' ? 'player-card__badge--junior' : ''}`}>
                {j.category || 'N/A'}
              </span>
            </div>
          ))}
        </div>
      )}

      {!loading && jugadoresFiltrados.length === 0 && jugadores.length > 0 && (
        <p className="empty-state">No se encontraron jugadores con ese filtro</p>
      )}
    </div>
  );
};

export default Jugadores;
