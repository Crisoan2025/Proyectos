// ============================================================
// TeamForm.jsx — Formulario para inscribir / editar equipos
// ============================================================
// POR QUÉ: Estaba embebido dentro de Admin.jsx (360 líneas).
// PARA QUÉ: Componente reutilizable y enfocado en una sola
// responsabilidad: crear un equipo nuevo con categoría.
//
// 🔧 AMPLIACIÓN (Ver/Editar/Eliminar equipos): ahora el form es
//   dual (alta + edición), siguiendo el mismo patrón que MatchForm:
//   se expone iniciarEdicion(equipo) vía forwardRef +
//   useImperativeHandle para que Admin dispare la edición desde la
//   TeamTable. Si hay un equipo en edición hace PUT; si no, POST.
// ============================================================

import { useState, forwardRef, useImperativeHandle } from 'react';
import api from '../../../services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ShieldPlus, Edit2 } from 'lucide-react';

const TeamForm = forwardRef(({ onTeamSaved }, ref) => {
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [entrenador, setEntrenador] = useState('');
  const [category, setCategory] = useState('Senior');
  // 🔧 AMPLIACIÓN: id del equipo en edición (null = alta). El estadio no se
  //   muestra como campo, pero lo guardamos para preservarlo al editar.
  const [editandoEquipoId, setEditandoEquipoId] = useState(null);
  const [stadium, setStadium] = useState('');

  // 🔧 AMPLIACIÓN: el padre (Admin) llama a esto desde la TeamTable para
  //   cargar los datos del equipo y pasar el form a modo edición.
  useImperativeHandle(ref, () => ({
    iniciarEdicion(equipo) {
      setEditandoEquipoId(equipo.id);
      setNombreEquipo(equipo.name || '');
      setEntrenador(equipo.coach_name || '');
      setCategory(equipo.category || 'Senior');
      setStadium(equipo.stadium || '');
    },
  }));

  const limpiarFormulario = () => {
    setNombreEquipo('');
    setEntrenador('');
    setCategory('Senior');
    setStadium('');
    setEditandoEquipoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // En alta autogeneramos el estadio (comportamiento previo); en edición
    // preservamos el existente para no pisarlo con null.
    const payload = {
      name: nombreEquipo,
      coach_name: entrenador,
      stadium: editandoEquipoId ? stadium : 'Estadio ' + nombreEquipo,
      category,
    };

    try {
      // 🔧 AMPLIACIÓN: PUT si estamos editando, POST si es alta nueva.
      const res = editandoEquipoId
        ? await api.put(`/equipos/${editandoEquipoId}`, payload, true)
        : await api.post('/equipos', payload, true);

      if (res.ok) {
        toast.success(editandoEquipoId ? 'Equipo actualizado' : '¡Equipo fichado!');
        limpiarFormulario();
        onTeamSaved();
      } else {
        const data = await res.json();
        toast.error(`Error: ${data.error || 'Hubo un error'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(editandoEquipoId ? 'Error al actualizar equipo' : 'Error al fichar equipo');
    }
  };

  return (
    <div className={`bg-nba-card p-6 rounded-lg flex-1 min-w-[300px] border ${editandoEquipoId ? 'border-nba-red' : 'border-nba-border'}`}>
      <div className={`flex items-center gap-2 mb-4 pb-2.5 border-b-2 ${editandoEquipoId ? 'border-nba-red text-nba-red' : 'border-nba-blue text-nba-blue'}`}>
        {editandoEquipoId ? <Edit2 className="w-5 h-5" /> : <ShieldPlus className="w-5 h-5" />}
        <h3 className="font-heading text-base font-bold tracking-wide m-0 text-nba-white block">
          {editandoEquipoId ? 'EDITAR EQUIPO' : 'INSCRIBIR EQUIPO'}
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <Input
          type="text"
          placeholder="Nombre"
          value={nombreEquipo}
          onChange={(e) => setNombreEquipo(e.target.value)}
          required
          className="bg-nba-dark border-nba-border text-nba-white placeholder:text-nba-gray"
        />
        <Input
          type="text"
          placeholder="DT"
          value={entrenador}
          onChange={(e) => setEntrenador(e.target.value)}
          className="bg-nba-dark border-nba-border text-nba-white placeholder:text-nba-gray"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-nba-dark border-nba-border text-nba-white">
            <SelectValue placeholder="Seleccionar Categoría" />
          </SelectTrigger>
          <SelectContent className="bg-nba-card border-nba-border text-nba-white">
            <SelectItem value="Senior">Senior</SelectItem>
            <SelectItem value="Junior">Junior</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" className="w-full bg-nba-red hover:bg-nba-red/90 text-white font-body font-bold tracking-widest mt-2 flex items-center justify-center gap-2">
          {editandoEquipoId ? <Edit2 className="w-4 h-4" /> : <ShieldPlus className="w-4 h-4" />}
          {editandoEquipoId ? 'ACTUALIZAR EQUIPO' : 'GUARDAR EQUIPO'}
        </Button>
        {/* 🔧 AMPLIACIÓN: salir del modo edición sin guardar. */}
        {editandoEquipoId && (
          <Button type="button" onClick={limpiarFormulario} variant="secondary" className="w-full font-body font-bold uppercase tracking-[0.8px] mt-1 bg-transparent border-nba-border text-nba-white hover:bg-white/5">
            CANCELAR EDICIÓN
          </Button>
        )}
      </form>
    </div>
  );
});

TeamForm.displayName = 'TeamForm';

export default TeamForm;
