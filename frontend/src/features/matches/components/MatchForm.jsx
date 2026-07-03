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
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Edit2, CalendarPlus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const MatchForm = forwardRef(({ equipos, onMatchSaved }, ref) => {
  const [localId, setLocalId] = useState('');
  const [visitanteId, setVisitanteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('20:00');
  const [lugar, setLugar] = useState('');
  const [fase, setFase] = useState('regular');
  const [editandoPartidoId, setEditandoPartidoId] = useState(null);

  useImperativeHandle(ref, () => ({
    iniciarEdicion(partido) {
      setEditandoPartidoId(partido.id);
      setLocalId(partido.local_team_id?.toString());
      setVisitanteId(partido.visitor_team_id?.toString());
      setFecha(partido.match_date.split('T')[0]);
      setHora(partido.match_time || '20:00');
      setLugar(partido.location || '');
      setFase(partido.phase || 'regular');
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
    setFase('regular');
    setEditandoPartidoId(null);
  };

  // items para los Select de base-ui: sin esto el trigger muestra el value
  // crudo (id del equipo / clave de la fase) en vez de la etiqueta.
  const equipoItems = Object.fromEntries(equipos.map((eq) => [eq.id.toString(), eq.name]));
  const faseItems = {
    regular: 'Temporada regular',
    cuartos: 'Playoffs — Cuartos',
    semis: 'Playoffs — Semifinal',
    final: 'Playoffs — Final',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (localId === visitanteId) {
      return toast.error('Falta técnica: Un equipo no puede jugar contra sí mismo.');
    }
    if (!fecha) {
      return toast.error('Por favor selecciona una fecha para el partido.');
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
        phase: fase,
      }, true);

      if (res.ok) {
        limpiarFormulario();
        onMatchSaved();
        toast.success(editandoPartidoId ? 'Partido actualizado' : 'Partido programado');
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar partido');
    }
  };

  return (
    <div className={`bg-nba-card p-6 rounded-lg flex-1 min-w-[300px] border ${editandoPartidoId ? 'border-nba-red' : 'border-nba-border'}`}>
      <div className={`flex items-center gap-2 mb-4 pb-2.5 border-b-2 ${editandoPartidoId ? 'border-nba-red text-nba-red' : 'border-nba-blue text-nba-blue'}`}>
        {editandoPartidoId ? <Edit2 className="w-5 h-5" /> : <CalendarPlus className="w-5 h-5" />}
        <h3 className="font-heading text-base font-bold tracking-wide m-0 text-nba-white">
          {editandoPartidoId ? 'EDITAR PARTIDO' : 'PROGRAMAR PARTIDO'}
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <Select value={localId} onValueChange={handleLocalChange} items={equipoItems} required>
          <SelectTrigger className="bg-nba-dark border-nba-border text-nba-white">
            <SelectValue placeholder="Seleccionar Local..." />
          </SelectTrigger>
          <SelectContent className="bg-nba-card border-nba-border text-nba-white">
            {equipos.map((eq) => (
              <SelectItem key={eq.id} value={eq.id.toString()}>{eq.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={visitanteId} onValueChange={setVisitanteId} items={equipoItems} required>
          <SelectTrigger className="bg-nba-dark border-nba-border text-nba-white">
            <SelectValue placeholder="Seleccionar Visitante..." />
          </SelectTrigger>
          <SelectContent className="bg-nba-card border-nba-border text-nba-white">
            {equipos.map((eq) => (
              <SelectItem key={eq.id} value={eq.id.toString()}>{eq.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2.5 flex-col sm:flex-row">
          <div className="flex-2 w-full">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal bg-nba-dark border-nba-border hover:bg-nba-dark/80 hover:text-white ${!fecha ? "text-nba-gray" : "text-nba-white"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-nba-blue" />
                  {fecha ? format(parseISO(fecha), "PPP", { locale: es }) : <span>Elegir fecha...</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-nba-card border-nba-border text-nba-white" align="start">
                <Calendar
                  mode="single"
                  selected={fecha ? parseISO(fecha) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      // Usar offset para no tener problemas de UTC
                      const offset = date.getTimezoneOffset();
                      const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
                      setFecha(adjustedDate.toISOString().split('T')[0]);
                    } else {
                      setFecha('');
                    }
                  }}
                  initialFocus
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          </div>
          <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required className="flex-1 w-full bg-nba-dark border-nba-border text-nba-white" />
        </div>

        <Input type="text" placeholder="Estadio / Lugar" value={lugar} onChange={(e) => setLugar(e.target.value)} required className="bg-nba-dark border-nba-border text-nba-white placeholder-nba-gray" />

        {/* Fase del partido: los de playoffs no suman a la tabla de posiciones */}
        <Select value={fase} onValueChange={setFase} items={faseItems}>
          <SelectTrigger className="bg-nba-dark border-nba-border text-nba-white">
            <SelectValue placeholder="Fase del partido" />
          </SelectTrigger>
          <SelectContent className="bg-nba-card border-nba-border text-nba-white">
            <SelectItem value="regular">Temporada regular</SelectItem>
            <SelectItem value="cuartos">Playoffs — Cuartos</SelectItem>
            <SelectItem value="semis">Playoffs — Semifinal</SelectItem>
            <SelectItem value="final">Playoffs — Final</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" className={`w-full font-body font-bold uppercase tracking-[0.8px] text-white mt-2 flex items-center justify-center gap-2 ${editandoPartidoId ? 'bg-nba-red hover:bg-nba-red/90' : 'bg-nba-blue hover:bg-nba-blue/90'}`}>
          {editandoPartidoId ? <Edit2 className="w-4 h-4" /> : <CalendarPlus className="w-4 h-4" />}
          {editandoPartidoId ? 'ACTUALIZAR PARTIDO' : 'PROGRAMAR'}
        </Button>
        {editandoPartidoId && (
          <Button type="button" onClick={limpiarFormulario} variant="secondary" className="w-full font-body font-bold uppercase tracking-[0.8px] mt-1 bg-transparent border-nba-border text-nba-white hover:bg-white/5">
            CANCELAR EDICIÓN
          </Button>
        )}
      </form>
    </div>
  );
});

MatchForm.displayName = 'MatchForm';

export default MatchForm;
