// ============================================================
// TeamForm.jsx — Formulario para inscribir equipos
// ============================================================
// POR QUÉ: Estaba embebido dentro de Admin.jsx (360 líneas).
// PARA QUÉ: Componente reutilizable y enfocado en una sola
// responsabilidad: crear un equipo nuevo con categoría.
// ============================================================

import { useState } from 'react';
import api from '../../../services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ShieldPlus } from 'lucide-react';

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
        toast.success('¡Equipo fichado!');
      } else {
        const data = await res.json();
        toast.error(`Error: ${data.error || 'Hubo un error'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al fichar equipo');
    }
  };

  return (
    <div className="bg-nba-card p-6 rounded-lg border border-nba-border flex-1 min-w-[300px]">
      <div className="flex items-center gap-2 mb-4 pb-2.5 border-b-2 border-nba-blue">
        <ShieldPlus className="w-5 h-5 text-nba-blue" />
        <h3 className="font-heading text-base font-bold tracking-wide m-0 text-nba-white block">INSCRIBIR EQUIPO</h3>
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
          <ShieldPlus className="w-4 h-4" />
          GUARDAR EQUIPO
        </Button>
      </form>
    </div>
  );
};

export default TeamForm;
