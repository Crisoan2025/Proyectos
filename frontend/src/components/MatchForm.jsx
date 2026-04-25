// ============================================================
// MatchForm.jsx — Formulario para programar/editar partidos
// ============================================================
// POR QUÉ: Era la sección más compleja de Admin.jsx, con lógica
// de creación, edición, autocompletado de estadio y validación.
// PARA QUÉ: Componente enfocado en gestionar partidos con un
// formulario dual (crear / editar). Usa forwardRef + useImperativeHandle
// para que el padre (Admin) pueda iniciar una edición desde la tabla.
// ============================================================

import { useState, forwardRef, useImperativeHandle } from 'react';
import api from '../services/api';

const MatchForm = forwardRef(({ equipos, onMatchSaved }, ref) => {
  const [localId, setLocalId] = useState('');
  const [visitanteId, setVisitanteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('20:00');
  const [lugar, setLugar] = useState('');
  const [editandoPartidoId, setEditandoPartidoId] = useState(null);

  // Exponer iniciarEdicion al componente padre via ref
  useImperativeHandle(ref, () => ({
    iniciarEdicion(partido) {
      setEditandoPartidoId(partido.id);
      setLocalId(partido.local_team_id);
      setVisitanteId(partido.visitor_team_id);
      setFecha(partido.match_date.split('T')[0]);
      setHora(partido.match_time || '20:00');
      setLugar(partido.location || '');
    },
  }));

  // Autocompletar estadio al seleccionar equipo local
  const handleLocalChange = (e) => {
    const id = e.target.value;
    setLocalId(id);
    const equipo = equipos.find((eq) => eq.id === Number(id));
    if (equipo && equipo.stadium) {
      setLugar(equipo.stadium);
    }
  };

  const limpiarFormulario = () => {
    setLocalId('');
    setVisitanteId('');
    setFecha('');
    setHora('20:00');
    setLugar('');
    setEditandoPartidoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (localId === visitanteId) {
      return alert('Falta técnica: Un equipo no puede jugar contra sí mismo.');
    }

    const endpoint = editandoPartidoId
      ? `/partidos/${editandoPartidoId}`
      : '/partidos';
    const method = editandoPartidoId ? 'put' : 'post';

    try {
      const res = await api[method](endpoint, {
        local_team_id: localId,
        visitor_team_id: visitanteId,
        match_date: fecha,
        match_time: hora,
        location: lugar,
      }, true);

      if (res.ok) {
        limpiarFormulario();
        onMatchSaved();
        alert(editandoPartidoId ? '¡Partido actualizado!' : '¡Partido programado!');
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`card ${editandoPartidoId ? 'card--editing' : ''}`}>
      <h3 className={`card-title ${editandoPartidoId ? 'card-title--red' : ''}`}>
        {editandoPartidoId ? '✏️ EDITAR PARTIDO' : '📅 PROGRAMAR PARTIDO'}
      </h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <select value={localId} onChange={handleLocalChange} required>
          <option value="">Seleccionar Local...</option>
          {equipos.map((eq) => (
            <option key={eq.id} value={eq.id}>{eq.name}</option>
          ))}
        </select>
        <select value={visitanteId} onChange={(e) => setVisitanteId(e.target.value)} required>
          <option value="">Seleccionar Visitante...</option>
          {equipos.map((eq) => (
            <option key={eq.id} value={eq.id}>{eq.name}</option>
          ))}
        </select>

        <div className="form-row">
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required style={{ flex: 2 }} />
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required style={{ flex: 1 }} />
        </div>

        <input type="text" placeholder="Estadio / Lugar" value={lugar} onChange={(e) => setLugar(e.target.value)} required />

        <button type="submit" className={`btn ${editandoPartidoId ? 'btn-danger' : 'btn-blue'}`}>
          {editandoPartidoId ? 'ACTUALIZAR PARTIDO' : 'PROGRAMAR'}
        </button>
        {editandoPartidoId && (
          <button type="button" onClick={limpiarFormulario} className="btn btn-secondary">
            CANCELAR EDICIÓN
          </button>
        )}
      </form>
    </div>
  );
});

MatchForm.displayName = 'MatchForm';

export default MatchForm;
