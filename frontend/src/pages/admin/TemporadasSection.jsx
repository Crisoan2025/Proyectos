// Sección "Temporadas" del panel admin. Ruta: /admin/temporadas
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarDays, PlusCircle } from 'lucide-react';

export default function TemporadasSection() {
  const { temporadaActiva, reloadEquipos, reloadPartidos, fetchTemporadaActiva } = useOutletContext();
  const [nuevaTemporada, setNuevaTemporada] = useState('');
  const [creandoTemporada, setCreandoTemporada] = useState(false);

  const handleCrearTemporada = async (e) => {
    e.preventDefault();
    if (!nuevaTemporada.trim()) return;

    setCreandoTemporada(true);
    try {
      const res = await api.post('/temporadas', { name: nuevaTemporada }, true);
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setNuevaTemporada('');
        fetchTemporadaActiva();
        reloadEquipos();
        reloadPartidos();
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al crear temporada');
    } finally {
      setCreandoTemporada(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="max-w-2xl w-full bg-nba-card p-6 rounded-lg border border-nba-border">
        <div className="flex items-center gap-2 mb-4 pb-2.5 border-b-2 border-nba-green">
          <CalendarDays className="w-5 h-5 text-nba-green" />
          <h3 className="font-heading text-base font-bold tracking-wide m-0 text-nba-white block">GESTIÓN DE TEMPORADA</h3>
        </div>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-nba-gray font-bold text-[0.8rem] uppercase tracking-wider">Temporada activa:</span>
            <span className="text-nba-white font-bold text-[0.9rem]">{temporadaActiva?.name || 'Sin temporada'}</span>
          </div>
        </div>
        <form onSubmit={handleCrearTemporada} className="flex flex-col gap-2.5 mt-3">
          <Input
            type="text"
            placeholder="Nombre de nueva temporada (ej: Temporada 2027)"
            value={nuevaTemporada}
            onChange={(e) => setNuevaTemporada(e.target.value)}
            required
            className="bg-nba-dark border-nba-border text-nba-white placeholder:text-nba-gray"
          />
          <Button type="submit" disabled={creandoTemporada} className="bg-nba-green hover:bg-nba-green/90 text-white font-body font-bold text-[0.8rem] uppercase tracking-[0.8px] flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            {creandoTemporada ? 'CREANDO...' : 'CREAR NUEVA TEMPORADA'}
          </Button>
        </form>
        <p className="text-[0.75rem] text-nba-gray mt-2">
          ⚠️ Al crear una nueva temporada, las estadísticas se reinician a 0 para todos los equipos.
        </p>
      </div>
    </div>
  );
}
