// ============================================================
// MatchTable.jsx — Tabla de fixture y resultados
// ============================================================
// POR QUÉ: La tabla más compleja de Admin.jsx con lógica de
// cargar resultados, editar y borrar partidos.
// PARA QUÉ: Componente que muestra el fixture y permite
// interactuar con cada partido (editar, borrar, cargar score).
// ============================================================

import { useState } from 'react';
import api from '../../../services/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Trophy, Edit2, Trash2 } from 'lucide-react';

const MatchTable = ({ partidos, onMatchUpdated, onEditMatch }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [partidoCargando, setPartidoCargando] = useState(null);
  const [puntosLocal, setPuntosLocal] = useState('');
  const [puntosVisitante, setPuntosVisitante] = useState('');

  const abrirModalCarga = (partido) => {
    setPartidoCargando(partido);
    setPuntosLocal('');
    setPuntosVisitante('');
    setModalOpen(true);
  };

  const handleGuardarResultado = async (e) => {
    e.preventDefault();
    if (!puntosLocal || !puntosVisitante) return;

    try {
      const res = await api.put(`/partidos/${partidoCargando.id}/resultado`, {
        local_points: parseInt(puntosLocal),
        visitor_points: parseInt(puntosVisitante),
      });
      if (res.ok) {
        toast.success('Resultado guardado exitosamente');
        setModalOpen(false);
        onMatchUpdated();
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.error || 'Hubo un error'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar el resultado');
    }
  };

  const handleBorrar = async (id) => {
    try {
      await api.del(`/partidos/${id}`);
      toast.success('Partido cancelado');
      onMatchUpdated();
    } catch (err) {
      console.error(err);
      toast.error('Error al borrar partido');
    }
  };

  return (
    <div className="bg-nba-card p-6 rounded-lg border border-nba-border flex-1 min-w-[500px] overflow-x-auto">
      <div className="flex items-center gap-2 mb-4 pb-2.5 border-b-2 border-nba-blue">
        <Trophy className="w-5 h-5 text-nba-blue" />
        <h3 className="font-heading text-base font-bold tracking-wide m-0 text-nba-white block">FIXTURE Y RESULTADOS</h3>
      </div>
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
                  <Button onClick={() => abrirModalCarga(p)} size="sm" className="bg-nba-green hover:bg-nba-green/80 text-white font-body font-bold text-[0.7rem] uppercase tracking-[0.8px] h-7 px-3">
                    Cargar
                  </Button>
                ) : (
                  <span className="text-nba-green font-bold text-[0.7rem] uppercase tracking-[1px]">FINAL</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {p.status !== 'jugado' && (
                  <div className="flex gap-1.5 justify-center">
                    <Button onClick={() => onEditMatch(p)} size="sm" className="bg-nba-gold hover:bg-nba-gold/80 text-black font-body font-bold text-[0.7rem] uppercase tracking-[0.8px] h-7 w-9 p-0 flex items-center justify-center">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-body font-bold text-[0.7rem] uppercase tracking-[0.8px] h-7 w-9 p-0 flex items-center justify-center">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-nba-card border-nba-border text-nba-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Seguro que querés cancelar este partido?</AlertDialogTitle>
                          <AlertDialogDescription className="text-nba-lightgray">
                            Esta acción no se puede deshacer y borrará el partido del fixture permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border-nba-border text-nba-white hover:bg-white/5 hover:text-white">Atrás</AlertDialogCancel>
                          <AlertDialogAction className="bg-nba-red text-white hover:bg-nba-red/90" onClick={() => handleBorrar(p.id)}>Sí, borrar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-nba-card border-nba-border text-nba-white">
          <DialogHeader>
            <DialogTitle>Cargar Resultado del Partido</DialogTitle>
          </DialogHeader>
          {partidoCargando && (
            <form onSubmit={handleGuardarResultado} className="flex flex-col gap-4 mt-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-[0.7rem] font-bold text-nba-gray uppercase tracking-wider">{partidoCargando.local_name}</label>
                  <Input type="number" min="0" required value={puntosLocal} onChange={e => setPuntosLocal(e.target.value)} className="bg-nba-dark border-nba-border text-nba-white mt-1 text-center font-bold text-lg" placeholder="Pts Local" />
                </div>
                <span className="text-xl font-black mt-5 text-nba-lightgray">VS</span>
                <div className="flex-1">
                  <label className="text-[0.7rem] font-bold text-nba-gray uppercase tracking-wider">{partidoCargando.visitor_name}</label>
                  <Input type="number" min="0" required value={puntosVisitante} onChange={e => setPuntosVisitante(e.target.value)} className="bg-nba-dark border-nba-border text-nba-white mt-1 text-center font-bold text-lg" placeholder="Pts Visitante" />
                </div>
              </div>
              <DialogFooter className="mt-6 flex gap-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="bg-transparent border-nba-border hover:bg-white/5 text-white flex-1 font-bold uppercase tracking-widest text-[0.8rem]">Cancelar</Button>
                <Button type="submit" className="bg-nba-green hover:bg-nba-green/90 text-white font-bold uppercase tracking-widest text-[0.8rem] flex-1">Guardar Puntos</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MatchTable;
