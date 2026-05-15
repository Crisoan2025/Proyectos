// ============================================================
// PlayerForm.jsx — Formulario para fichar jugadores
// ============================================================
// POR QUÉ: Era otra sección embebida en Admin.jsx con su propio
// conjunto de 4 estados y lógica de submit.
// PARA QUÉ: Componente enfocado exclusivamente en la creación
// de jugadores, recibiendo la lista de equipos por props.
// ============================================================

import { useState } from 'react';
import api from '../../../services/api';

const PlayerForm = ({ equipos, onPlayerCreated }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [categoria, setCategoria] = useState('Senior');
  const [equipoId, setEquipoId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/jugadores', {
        name: nombre,
        surname: apellido,
        category: categoria,
        team_id: equipoId,
      }, true);

      if (res.ok) {
        setNombre('');
        setApellido('');
        setCategoria('Senior');
        setEquipoId('');
        onPlayerCreated();
        alert('¡Jugador fichado con éxito!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-nba-card p-6 rounded-lg border border-nba-border flex-1 min-w-[300px]">
      <h3 className="font-heading text-base font-bold tracking-wide m-0 mb-4 pb-2.5 border-b-2 border-nba-green text-nba-white block">🏃‍♂️ FICHAR JUGADOR</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <div className="flex gap-2.5">
          <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="flex-1 bg-nba-dark border border-nba-border rounded px-3 py-3 text-[0.9rem] text-nba-white font-body transition-all focus:outline-none focus:border-nba-blue focus:ring-4 focus:ring-nba-blue/20 placeholder-nba-gray" />
          <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required className="flex-1 bg-nba-dark border border-nba-border rounded px-3 py-3 text-[0.9rem] text-nba-white font-body transition-all focus:outline-none focus:border-nba-blue focus:ring-4 focus:ring-nba-blue/20 placeholder-nba-gray" />
        </div>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="bg-nba-dark border border-nba-border rounded px-3 py-3 text-[0.9rem] text-nba-white font-body transition-all focus:outline-none focus:border-nba-blue focus:ring-4 focus:ring-nba-blue/20">
          <option value="Senior">Senior</option>
          <option value="Junior">Junior</option>
        </select>
        <select value={equipoId} onChange={(e) => setEquipoId(e.target.value)} required className="bg-nba-dark border border-nba-border rounded px-3 py-3 text-[0.9rem] text-nba-white font-body transition-all focus:outline-none focus:border-nba-blue focus:ring-4 focus:ring-nba-blue/20">
          <option value="">¿A qué equipo va?</option>
          {equipos.map((eq) => (
            <option key={eq.id} value={eq.id}>{eq.name}</option>
          ))}
        </select>
        <button type="submit" className="font-body font-bold text-[0.8rem] uppercase tracking-[0.8px] py-3 px-4 rounded border-none cursor-pointer text-white transition-all bg-nba-green hover:shadow-[0_4px_14px_rgba(0,166,81,0.4)] hover:-translate-y-px mt-2">
          FICHAR
        </button>
      </form>
    </div>
  );
};

export default PlayerForm;
