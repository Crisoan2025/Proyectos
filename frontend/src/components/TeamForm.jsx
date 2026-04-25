// ============================================================
// TeamForm.jsx — Formulario para inscribir equipos
// ============================================================
// POR QUÉ: Estaba embebido dentro de Admin.jsx (360 líneas).
// PARA QUÉ: Componente reutilizable y enfocado en una sola
// responsabilidad: crear un equipo nuevo.
// ============================================================

import { useState } from 'react';
import api from '../services/api';

const TeamForm = ({ onTeamCreated }) => {
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [entrenador, setEntrenador] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/equipos', {
        name: nombreEquipo,
        coach_name: entrenador,
        stadium: 'Estadio ' + nombreEquipo,
      }, true);

      if (res.ok) {
        setNombreEquipo('');
        setEntrenador('');
        onTeamCreated();
        alert('¡Equipo fichado!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">➕ INSCRIBIR EQUIPO</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <input
          type="text"
          placeholder="Nombre"
          value={nombreEquipo}
          onChange={(e) => setNombreEquipo(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="DT"
          value={entrenador}
          onChange={(e) => setEntrenador(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          GUARDAR EQUIPO
        </button>
      </form>
    </div>
  );
};

export default TeamForm;
