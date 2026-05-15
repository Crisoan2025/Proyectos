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
    <div className="max-w-7xl mx-auto py-10 px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-nba-card py-5 px-6 rounded-lg border border-nba-border mb-8 shadow-sm">
        <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-nba-white m-0 mb-4 sm:mb-0">🏃‍♂️ Jugadores de la Liga</h2>
        <div className="flex gap-2">
          {['', 'Senior', 'Junior'].map((cat) => (
            <button
              key={cat}
              className={`px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.8px] bg-transparent text-nba-gray border border-nba-border rounded cursor-pointer transition-all hover:text-nba-white hover:border-nba-gray ${categoryFilter === cat ? '!bg-nba-blue !text-nba-white !border-nba-blue' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat || 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-nba-dark p-4 rounded-lg border border-nba-border">
        <input
          type="text"
          placeholder="🔍 Buscar jugador por nombre o apellido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md bg-nba-card border border-nba-border rounded px-4 py-2.5 text-[0.9rem] text-nba-white focus:outline-none focus:border-nba-blue focus:ring-2 focus:ring-nba-blue/25 placeholder-nba-gray transition-all"
        />
        <span className="text-[0.8rem] font-bold uppercase tracking-wider text-nba-gray">
          {jugadoresFiltrados.length} jugador{jugadoresFiltrados.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {loading && <p className="text-nba-blue font-semibold p-6 text-center">Cargando jugadores...</p>}
      {error && <p className="text-nba-red font-semibold p-6 text-center">❌ Error: {error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {jugadoresFiltrados.map((j) => (
            <div key={j.id} className="flex items-center gap-4 bg-nba-card rounded-lg border border-nba-border p-4 transition-transform hover:-translate-y-1 hover:shadow-md cursor-default">
              <div className="w-12 h-12 bg-gradient-to-br from-nba-blue to-nba-dark rounded-full flex items-center justify-center font-heading font-black text-nba-white tracking-widest shrink-0 shadow-inner">
                {j.surname?.charAt(0)}{j.name?.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-heading text-base font-black uppercase tracking-wide text-nba-white m-0 truncate">{j.surname}, {j.name}</h3>
                <span className="block text-[0.75rem] text-nba-lightgray mt-1 truncate">
                  {j.team_name || 'Agente Libre'}
                </span>
              </div>
              <span className={`text-[0.65rem] font-bold uppercase tracking-[0.5px] py-1 px-2 rounded-sm inline-block ${j.category === 'Junior' ? 'bg-nba-green/20 text-nba-green' : 'bg-nba-blue/20 text-[#5b8def]'}`}>
                {j.category || 'N/A'}
              </span>
            </div>
          ))}
        </div>
      )}

      {!loading && jugadoresFiltrados.length === 0 && jugadores.length > 0 && (
        <p className="text-center p-6 text-nba-gray">No se encontraron jugadores con ese filtro</p>
      )}
    </div>
  );
};

export default Jugadores;
