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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

const PlayerForm = ({ equipos, onPlayerCreated }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [equipoId, setEquipoId] = useState('');
  const [category, setCategory] = useState('Senior');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/jugadores', {
        name: nombre,
        surname: apellido,
        team_id: equipoId || null,
        category,
      }, true);

      if (res.ok) {
        setNombre('');
        setApellido('');
        setEquipoId('');
        setCategory('Senior');
        onPlayerCreated();
        toast.success('¡Jugador registrado exitosamente!');
      } else {
        const data = await res.json();
        toast.error(`Error: ${data.error || 'Hubo un error'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al registrar jugador');
    }
  };

  return (
    <div className="bg-nba-card p-6 rounded-lg border border-nba-border flex-1 min-w-[300px]">
      <div className="flex items-center gap-2 mb-4 pb-2.5 border-b-2 border-nba-green">
        <UserPlus className="w-5 h-5 text-nba-green" />
        <h3 className="font-heading text-base font-bold tracking-wide m-0 text-nba-white block">FICHA DE JUGADOR</h3>
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

        <Button type="submit" className="w-full bg-nba-green hover:bg-nba-green/90 text-white font-body font-bold tracking-widest mt-2 flex items-center justify-center gap-2">
          <UserPlus className="w-4 h-4" />
          REGISTRAR JUGADOR
        </Button>
      </form>
    </div>
  );
};

export default PlayerForm;
