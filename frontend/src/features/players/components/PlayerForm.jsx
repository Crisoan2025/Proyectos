// ============================================================
// PlayerForm.jsx — Formulario para fichar / editar jugadores
// ============================================================
// POR QUÉ: Era otra sección embebida en Admin.jsx con su propio
// conjunto de 4 estados y lógica de submit.
// PARA QUÉ: Componente enfocado en gestionar jugadores con un
// formulario dual (crear / editar).
//
// 🔧 AMPLIACIÓN: ahora soporta EDICIÓN además del alta, siguiendo el
//   mismo patrón que MatchForm/TeamForm: forwardRef + useImperativeHandle
//   para que el padre (Admin) inicie una edición desde la tabla (lápiz).
//   El backend ya exponía PUT /jugadores/:id (editarJugador); solo faltaba
//   esta parte del front. Callback renombrado onPlayerCreated → onPlayerSaved.
// ============================================================

import { useState, forwardRef, useImperativeHandle } from 'react';
import api from '../../../services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus, UserCog } from 'lucide-react';

const PlayerForm = forwardRef(({ equipos, onPlayerSaved }, ref) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [equipoId, setEquipoId] = useState('');
  const [category, setCategory] = useState('Senior');
  const [photoUrl, setPhotoUrl] = useState('');
  const [editandoJugadorId, setEditandoJugadorId] = useState(null);

  // El padre (Admin) llama a esto desde el botón "editar" de la tabla.
  useImperativeHandle(ref, () => ({
    iniciarEdicion(jugador) {
      setEditandoJugadorId(jugador.id);
      setNombre(jugador.name || '');
      setApellido(jugador.surname || '');
      setEquipoId(jugador.team_id ? jugador.team_id.toString() : '');
      setCategory(jugador.category || 'Senior');
      setPhotoUrl(jugador.photo_url || '');
    },
  }));

  const limpiarFormulario = () => {
    setNombre('');
    setApellido('');
    setEquipoId('');
    setCategory('Senior');
    setPhotoUrl('');
    setEditandoJugadorId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = editandoJugadorId ? `/jugadores/${editandoJugadorId}` : '/jugadores';
    const method = editandoJugadorId ? 'put' : 'post';

    try {
      const res = await api[method](endpoint, {
        name: nombre,
        surname: apellido,
        team_id: equipoId || null,
        category,
        photo_url: photoUrl || null,
      }, true);

      if (res.ok) {
        limpiarFormulario();
        onPlayerSaved();
        toast.success(editandoJugadorId ? 'Jugador actualizado' : '¡Jugador registrado exitosamente!');
      } else {
        const data = await res.json();
        toast.error(`Error: ${data.error || 'Hubo un error'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(editandoJugadorId ? 'Error al actualizar jugador' : 'Error al registrar jugador');
    }
  };

  return (
    <div className={`bg-nba-card p-6 rounded-lg flex-1 min-w-[300px] border ${editandoJugadorId ? 'border-nba-red' : 'border-nba-border'}`}>
      <div className={`flex items-center gap-2 mb-4 pb-2.5 border-b-2 ${editandoJugadorId ? 'border-nba-red text-nba-red' : 'border-nba-green text-nba-green'}`}>
        {editandoJugadorId ? <UserCog className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
        <h3 className="font-heading text-base font-bold tracking-wide m-0 text-nba-white block">
          {editandoJugadorId ? 'EDITAR JUGADOR' : 'FICHA DE JUGADOR'}
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <div className="flex gap-2.5">
          <Input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="flex-1 bg-nba-dark border-nba-border text-nba-white placeholder:text-nba-gray"
          />
          <Input
            type="text"
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
            className="flex-1 bg-nba-dark border-nba-border text-nba-white placeholder:text-nba-gray"
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-nba-dark border-nba-border text-nba-white">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="bg-nba-card border-nba-border text-nba-white">
            <SelectItem value="Senior">Senior</SelectItem>
            <SelectItem value="Junior">Junior</SelectItem>
          </SelectContent>
        </Select>

        <Select value={equipoId} onValueChange={setEquipoId}>
          <SelectTrigger className="bg-nba-dark border-nba-border text-nba-white">
            <SelectValue placeholder="Sin Equipo (Agente Libre)" />
          </SelectTrigger>
          <SelectContent className="bg-nba-card border-nba-border text-nba-white">
            <SelectItem value="">Sin Equipo (Agente Libre)</SelectItem>
            {equipos.map((eq) => (
              <SelectItem key={eq.id} value={eq.id.toString()}>{eq.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Foto del jugador (URL, opcional) con vista previa */}
        <div className="flex items-center gap-2.5">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-nba-border shrink-0" onError={(e) => { e.currentTarget.style.opacity = '0.2'; }} />
          ) : (
            <div className="w-10 h-10 rounded-full bg-nba-dark border border-nba-border flex items-center justify-center text-nba-gray text-[0.7rem] shrink-0">🏀</div>
          )}
          <Input
            type="url"
            placeholder="URL de la foto (opcional)"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="flex-1 bg-nba-dark border-nba-border text-nba-white placeholder:text-nba-gray"
          />
        </div>

        <Button type="submit" className={`w-full font-body font-bold uppercase tracking-widest text-white mt-2 flex items-center justify-center gap-2 ${editandoJugadorId ? 'bg-nba-red hover:bg-nba-red/90' : 'bg-nba-green hover:bg-nba-green/90'}`}>
          {editandoJugadorId ? <UserCog className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {editandoJugadorId ? 'ACTUALIZAR JUGADOR' : 'REGISTRAR JUGADOR'}
        </Button>

        {editandoJugadorId && (
          <Button type="button" onClick={limpiarFormulario} variant="secondary" className="w-full font-body font-bold uppercase tracking-widest mt-1 bg-transparent border-nba-border text-nba-white hover:bg-white/5">
            CANCELAR EDICIÓN
          </Button>
        )}
      </form>
    </div>
  );
});

PlayerForm.displayName = 'PlayerForm';

export default PlayerForm;
