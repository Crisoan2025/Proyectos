// ============================================================
// MatchTable.jsx — Tabla de fixture y resultados
// ============================================================
// POR QUÉ: La tabla más compleja de Admin.jsx con lógica de
// cargar resultados, editar y borrar partidos.
// PARA QUÉ: Componente que muestra el fixture y permite
// interactuar con cada partido (editar, borrar, cargar score).
// ============================================================

import api from '../../../services/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MatchTable = ({ partidos, onMatchUpdated, onEditMatch }) => {

  const handleCargarResultado = async (id) => {
    const puntosLocal = window.prompt('Ingresá los puntos del equipo LOCAL:');
    const puntosVisitante = window.prompt('Ingresá los puntos del equipo VISITANTE:');
    if (!puntosLocal || !puntosVisitante) return;

    try {
      const res = await api.put(`/partidos/${id}/resultado`, {
        local_points: parseInt(puntosLocal),
        visitor_points: parseInt(puntosVisitante),
      });
      if (res.ok) {
        alert('¡Resultado guardado!');
        onMatchUpdated();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Hubo un error'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBorrar = async (id) => {
    if (!window.confirm('¿Seguro que querés cancelar y borrar este partido?')) return;
    try {
      await api.del(`/partidos/${id}`);
      onMatchUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-nba-card p-6 rounded-lg border border-nba-border flex-1 min-w-[500px] overflow-x-auto">
      <h3 className="font-heading text-base font-bold tracking-wide m-0 mb-4 pb-2.5 border-b-2 border-nba-blue text-nba-white block">🏆 FIXTURE Y RESULTADOS</h3>
      <Table className="mt-3">
        <TableHeader>
          <TableRow className="border-nba-border hover:bg-transparent">
            <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] text-center">Cuándo / Dónde</TableHead>
            <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] text-center">Encuentro</TableHead>
            <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] text-center">Score</TableHead>
            <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] text-center">Opciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partidos.map((p) => (
            <TableRow key={p.id} className="border-nba-border/50 hover:bg-white/5 transition-colors">
              <TableCell className="text-[0.75rem] text-nba-gray text-center">
                <strong className="text-nba-lightgray">{new Date(p.match_date).toLocaleDateString()} - {p.match_time || '20:00'}</strong>
                <br />
                📍 {p.location || 'Estadio Central'}
              </TableCell>
              <TableCell className="text-center">
                <div className="font-bold text-[0.85rem] text-nba-white">{p.local_name}</div>
                <div className={`font-black my-1 text-[1.1rem] ${p.status === 'jugado' ? 'text-nba-red' : 'text-nba-gray'}`}>
                  {p.status === 'jugado' ? `${p.local_points} - ${p.visitor_points}` : 'VS'}
                </div>
                <div className="font-bold text-[0.85rem] text-nba-white">{p.visitor_name}</div>
              </TableCell>
              <TableCell className="text-center">
                {p.status !== 'jugado' ? (
                  <Button onClick={() => handleCargarResultado(p.id)} size="sm" className="bg-nba-green hover:bg-nba-green/80 text-white font-body font-bold text-[0.7rem] uppercase tracking-[0.8px] h-7 px-3">
                    Cargar
                  </Button>
                ) : (
                  <span className="text-nba-green font-bold text-[0.7rem] uppercase tracking-[1px]">FINAL</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {p.status !== 'jugado' && (
                  <div className="flex gap-1.5 justify-center">
                    <Button onClick={() => onEditMatch(p)} size="sm" className="bg-nba-gold hover:bg-nba-gold/80 text-black font-body font-bold text-[0.7rem] uppercase tracking-[0.8px] h-7 px-3">✏️</Button>
                    <Button onClick={() => handleBorrar(p.id)} size="sm" className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-body font-bold text-[0.7rem] uppercase tracking-[0.8px] h-7 px-3">🗑️</Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
          {partidos.length === 0 && (
            <TableRow className="border-nba-border/50 hover:bg-transparent">
              <TableCell colSpan={4} className="text-center p-6 text-nba-gray">No hay partidos programados.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MatchTable;
