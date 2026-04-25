// ============================================================
// PlayerForm.jsx — Formulario para fichar jugadores
// ============================================================
// POR QUÉ: Era otra sección embebida en Admin.jsx con su propio
// conjunto de 4 estados y lógica de submit.
// PARA QUÉ: Componente enfocado exclusivamente en la creación
// de jugadores, recibiendo la lista de equipos por props.
// ============================================================

import { useState } from 'react';
import api from '../services/api';

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
    <div className="card">
      <h3 className="card-title card-title--green">🏃‍♂️ FICHAR JUGADOR</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ flex: 1 }} />
          <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required style={{ flex: 1 }} />
        </div>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="Senior">Senior</option>
          <option value="Junior">Junior</option>
        </select>
        <select value={equipoId} onChange={(e) => setEquipoId(e.target.value)} required>
          <option value="">¿A qué equipo va?</option>
          {equipos.map((eq) => (
            <option key={eq.id} value={eq.id}>{eq.name}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-green">
          FICHAR
        </button>
      </form>
    </div>
  );
};

export default PlayerForm;
