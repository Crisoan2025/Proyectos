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
import api from '../../../services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MatchForm = forwardRef(({ equipos, onMatchSaved }, ref) => {
  const [localId, setLocalId] = useState('');
  const [visitanteId, setVisitanteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('20:00');
  const [lugar, setLugar] = useState('');
  const [editandoPartidoId, setEditandoPartidoId] = useState(null);

  useImperativeHandle(ref, () => ({
    iniciarEdicion(partido) {
      setEditandoPartidoId(partido.id);
      setLocalId(partido.local_team_id?.toString());
      setVisitanteId(partido.visitor_team_id?.toString());
      setFecha(partido.match_date.split('T')[0]);
      setHora(partido.match_time || '20:00');
      setLugar(partido.location || '');
    },
  }));

  const handleLocalChange = (value) => {
    setLocalId(value);
    const equipo = equipos.find((eq) => eq.id === Number(value));
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
    <div className={`bg-nba-card p-6 rounded-lg flex-1 min-w-[300px] border ${editandoPartidoId ? 'border-nba-red' : 'border-nba-border'}`}>
      <h3 className={`font-heading text-base font-bold tracking-wide m-0 mb-4 pb-2.5 border-b-2 block text-nba-white ${editandoPartidoId ? 'border-nba-red' : 'border-nba-blue'}`}>
        {editandoPartidoId ? '✏️ EDITAR PARTIDO' : '📅 PROGRAMAR PARTIDO'}
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <Select value={localId} onValueChange={handleLocalChange} required>
          <SelectTrigger className="bg-nba-dark border-nba-border text-nba-white">
            <SelectValue placeholder="Seleccionar Local..." />
          </SelectTrigger>
          <SelectContent className="bg-nba-card border-nba-border text-nba-white">
            {equipos.map((eq) => (
              <SelectItem key={eq.id} value={eq.id.toString()}>{eq.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={visitanteId} onValueChange={setVisitanteId} required>
          <SelectTrigger className="bg-nba-dark border-nba-border text-nba-white">
            <SelectValue placeholder="Seleccionar Visitante..." />
          </SelectTrigger>
          <SelectContent className="bg-nba-card border-nba-border text-nba-white">
            {equipos.map((eq) => (
              <SelectItem key={eq.id} value={eq.id.toString()}>{eq.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2.5">
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required className="flex-2 bg-nba-dark border-nba-border text-nba-white" />
          <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required className="flex-1 bg-nba-dark border-nba-border text-nba-white" />
        </div>

        <Input type="text" placeholder="Estadio / Lugar" value={lugar} onChange={(e) => setLugar(e.target.value)} required className="bg-nba-dark border-nba-border text-nba-white placeholder-nba-gray" />

        <Button type="submit" className={`w-full font-body font-bold uppercase tracking-[0.8px] text-white mt-2 ${editandoPartidoId ? 'bg-nba-red hover:bg-nba-red/90' : 'bg-nba-blue hover:bg-nba-blue/90'}`}>
          {editandoPartidoId ? 'ACTUALIZAR PARTIDO' : 'PROGRAMAR'}
        </Button>
        {editandoPartidoId && (
          <Button type="button" onClick={limpiarFormulario} variant="secondary" className="w-full font-body font-bold uppercase tracking-[0.8px] mt-1">
            CANCELAR EDICIÓN
          </Button>
        )}
      </form>
    </div>
  );
});

MatchForm.displayName = 'MatchForm';

export default MatchForm;
