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
    <div className="max-w-7xl mx-auto py-10 px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-nba-card py-5 px-6 rounded-lg border border-nba-border mb-8 shadow-sm">
        <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-nba-white m-0 mb-4 sm:mb-0">🏀 Equipos de la Liga</h2>
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

      {loading && <p className="text-nba-blue font-semibold p-6 text-center">Cargando equipos...</p>}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
        {equipos.map((equipo) => (
          <div key={equipo.id} className="bg-nba-card rounded-lg border border-nba-border p-5 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:border-nba-blue" onClick={() => verDetalle(equipo.id)}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl bg-nba-dark w-[50px] h-[50px] rounded-full flex items-center justify-center border border-nba-border">🏀</span>
              <div>
                <h3 className="font-heading text-lg font-black uppercase tracking-wide text-nba-white m-0">{equipo.name}</h3>
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-nba-gray">{equipo.category}</span>
              </div>
            </div>
            <div className="text-[0.85rem] text-nba-lightgray mb-5 pb-4 border-b border-nba-border">
              <span className="text-nba-gray font-bold text-[0.7rem] uppercase tracking-wider mr-1">DT:</span> {equipo.coach_name}
            </div>
            <div className="flex justify-between bg-nba-dark rounded p-3">
              <div className="flex flex-col items-center">
                <span className="font-black text-lg text-nba-gold">{equipo.points}</span>
                <span className="text-[0.6rem] font-bold uppercase tracking-wider text-nba-gray mt-1">PTS</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-black text-lg text-nba-green">{equipo.won}</span>
                <span className="text-[0.6rem] font-bold uppercase tracking-wider text-nba-gray mt-1">W</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-black text-lg text-nba-red">{equipo.lost}</span>
                <span className="text-[0.6rem] font-bold uppercase tracking-wider text-nba-gray mt-1">L</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-black text-lg text-nba-white">{equipo.played}</span>
                <span className="text-[0.6rem] font-bold uppercase tracking-wider text-nba-gray mt-1">PJ</span>
              </div>
            </div>

            {/* Detalle expandido con roster */}
            {equipoDetalle?.id === equipo.id && (
              <div className="mt-5 pt-5 border-t border-dashed border-nba-border animate-pulse">
                <h4 className="font-heading text-[0.85rem] font-black text-nba-white uppercase tracking-wider m-0 mb-3">📋 Roster ({equipoDetalle.jugadores?.length || 0} jugadores)</h4>
                {equipoDetalle.jugadores && equipoDetalle.jugadores.length > 0 ? (
                  <ul className="list-none m-0 p-0 flex flex-col gap-2">
                    {equipoDetalle.jugadores.map((j) => (
                      <li key={j.id} className="flex justify-between items-center py-1.5 px-3 bg-nba-dark rounded border border-nba-border">
                        <span className="text-[0.8rem] text-nba-lightgray font-semibold">{j.surname}, {j.name}</span>
                        <span className="text-[0.65rem] text-nba-gray font-bold uppercase">{j.category}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center p-6 text-nba-gray">Sin jugadores registrados</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && equipos.length === 0 && (
        <p className="text-center p-6 text-nba-gray">No se encontraron equipos para esta categoría</p>
      )}
    </div>
  );
};

export default Equipos;
