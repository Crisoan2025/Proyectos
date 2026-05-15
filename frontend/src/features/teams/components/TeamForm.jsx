// ============================================================
// TeamForm.jsx — Formulario para inscribir equipos
// ============================================================
// POR QUÉ: Estaba embebido dentro de Admin.jsx (360 líneas).
// PARA QUÉ: Componente reutilizable y enfocado en una sola
// responsabilidad: crear un equipo nuevo con categoría.
// ============================================================

import { useState } from 'react';
import api from '../../../services/api';

const TeamForm = ({ onTeamCreated }) => {
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [entrenador, setEntrenador] = useState('');
  const [category, setCategory] = useState('Senior');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/equipos', {
        name: nombreEquipo,
        coach_name: entrenador,
        stadium: 'Estadio ' + nombreEquipo,
        category,
      }, true);

      if (res.ok) {
        setNombreEquipo('');
        setEntrenador('');
        setCategory('Senior');
        onTeamCreated();
        alert('¡Equipo fichado!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-nba-card p-6 rounded-lg border border-nba-border flex-1 min-w-[300px]">
      <h3 className="font-heading text-base font-bold tracking-wide m-0 mb-4 pb-2.5 border-b-2 border-nba-blue text-nba-white block">➕ INSCRIBIR EQUIPO</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <input
          type="text"
          placeholder="Nombre"
          value={nombreEquipo}
          onChange={(e) => setNombreEquipo(e.target.value)}
          required
          className="bg-nba-dark border border-nba-border rounded px-3 py-3 text-[0.9rem] text-nba-white font-body transition-all focus:outline-none focus:border-nba-blue focus:ring-4 focus:ring-nba-blue/20 placeholder-nba-gray"
        />
        <input
          type="text"
          placeholder="DT"
          value={entrenador}
          onChange={(e) => setEntrenador(e.target.value)}
          className="bg-nba-dark border border-nba-border rounded px-3 py-3 text-[0.9rem] text-nba-white font-body transition-all focus:outline-none focus:border-nba-blue focus:ring-4 focus:ring-nba-blue/20 placeholder-nba-gray"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-nba-dark border border-nba-border rounded px-3 py-3 text-[0.9rem] text-nba-white font-body transition-all focus:outline-none focus:border-nba-blue focus:ring-4 focus:ring-nba-blue/20">
          <option value="Senior">🏅 Senior</option>
          <option value="Junior">🌱 Junior</option>
        </select>
        <button type="submit" className="font-body font-bold text-[0.8rem] uppercase tracking-[0.8px] py-3 px-4 rounded border-none cursor-pointer text-white transition-all bg-nba-red hover:shadow-[0_4px_14px_rgba(200,16,46,0.4)] hover:-translate-y-px mt-2">
          GUARDAR EQUIPO
        </button>
      </form>
    </div>
  );
};

export default TeamForm;
