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
        toast.success('¡Jugador fichado con éxito!');
      } else {
        const data = await res.json();
        toast.error(`Error: ${data.error || 'Hubo un error'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al fichar jugador');
    }
  };

  return (
    <div className="bg-nba-card p-6 rounded-lg border border-nba-border flex-1 min-w-[300px]">
      <h3 className="font-heading text-base font-bold tracking-wide m-0 mb-4 pb-2.5 border-b-2 border-nba-green text-nba-white block">🏃‍♂️ FICHAR JUGADOR</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <div className="flex gap-2.5">
          <Input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="flex-1 bg-nba-dark border-nba-border text-nba-white placeholder:text-nba-gray" />
          <Input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required className="flex-1 bg-nba-dark border-nba-border text-nba-white placeholder:text-nba-gray" />
        </div>
        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger className="bg-nba-dark border-nba-border text-nba-white">
            <SelectValue placeholder="Seleccionar Categoría" />
          </SelectTrigger>
          <SelectContent className="bg-nba-card border-nba-border text-nba-white">
            <SelectItem value="Senior">Senior</SelectItem>
            <SelectItem value="Junior">Junior</SelectItem>
          </SelectContent>
        </Select>
        <Select value={equipoId} onValueChange={setEquipoId} required>
          <SelectTrigger className="bg-nba-dark border-nba-border text-nba-white">
            <SelectValue placeholder="¿A qué equipo va?" />
          </SelectTrigger>
          <SelectContent className="bg-nba-card border-nba-border text-nba-white">
            {equipos.map((eq) => (
              <SelectItem key={eq.id} value={eq.id.toString()}>{eq.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" className="w-full bg-nba-green hover:bg-nba-green/90 text-white font-body font-bold uppercase tracking-[0.8px] mt-2">
          FICHAR
        </Button>
      </form>
    </div>
  );
};

export default PlayerForm;
