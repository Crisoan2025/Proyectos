// ============================================================
// TeamTable.jsx — Tabla de equipos inscriptos
// ============================================================
// POR QUÉ: La sección "Equipos" del panel admin solo permitía
// crear equipos (TeamForm), pero no había forma de verlos,
// editarlos ni eliminarlos desde ahí — a diferencia de Partidos
// y Jugadores que sí tienen su tabla con acciones.
// PARA QUÉ: Componente presentacional (mismo patrón que
// PlayerTable / MatchTable): recibe los equipos por props, delega
// la edición al padre vía onEditTeam y el borrado vía onTeamDeleted.
// ============================================================

import api from '../../../services/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ShieldCheck, Edit2, Trash2 } from 'lucide-react';

const TeamTable = ({ equipos, onTeamDeleted, onEditTeam }) => {

  const handleBorrar = async (id) => {
    try {
      const res = await api.del(`/equipos/${id}`);
      if (res.ok) {
        toast.success('Equipo eliminado exitosamente');
        onTeamDeleted();
      } else {
        // El backend puede rechazar el borrado (p. ej. equipo con partidos asociados).
        const data = await res.json();
        toast.error(`Error: ${data.error || 'No se pudo eliminar el equipo'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar el equipo');
    }
  };

  return (
    <div className="bg-nba-card p-6 rounded-lg border border-nba-border flex-1 min-w-[400px] overflow-x-auto">
      <div className="flex items-center gap-2 mb-4 pb-2.5 border-b-2 border-nba-blue">
        <ShieldCheck className="w-5 h-5 text-nba-blue" />
        <h3 className="font-heading text-base font-bold tracking-wide m-0 text-nba-white block">PLANTEL DE EQUIPOS</h3>
      </div>
      <Table className="mt-3">
        <TableHeader>
          <TableRow className="border-nba-border hover:bg-transparent">
            <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem]">Equipo</TableHead>
            <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem]">DT</TableHead>
            <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] text-center">Cat.</TableHead>
            <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] text-center">Opciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipos.map((eq) => (
            <TableRow key={eq.id} className="border-nba-border/50 hover:bg-white/5 transition-colors">
              <TableCell className="font-bold uppercase text-nba-white text-[0.85rem]">
                <div className="flex items-center gap-2">
                  {eq.logo_url ? (
                    <img src={eq.logo_url} alt="" className="w-6 h-6 rounded object-contain bg-white/5 shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <span className="text-sm shrink-0">🏀</span>
                  )}
                  {eq.name}
                </div>
              </TableCell>
              <TableCell className="text-[0.75rem] text-nba-gray">{eq.coach_name || '—'}</TableCell>
              <TableCell className="text-center text-[0.75rem] text-nba-lightgray">{eq.category}</TableCell>
              <TableCell className="text-center">
                <div className="flex gap-1.5 justify-center">
                  <Button onClick={() => onEditTeam(eq)} size="sm" className="bg-nba-gold hover:bg-nba-gold/80 text-black font-body font-bold text-[0.7rem] uppercase tracking-[0.8px] h-7 w-9 p-0 flex items-center justify-center">
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
                        <AlertDialogTitle>¿Eliminar a {eq.name}?</AlertDialogTitle>
                        <AlertDialogDescription className="text-nba-lightgray">
                          Se eliminará permanentemente el equipo y sus estadísticas de la liga. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-nba-border text-nba-white hover:bg-white/5 hover:text-white">Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-nba-red text-white hover:bg-nba-red/90" onClick={() => handleBorrar(eq.id)}>Confirmar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {equipos.length === 0 && (
            <TableRow className="border-nba-border/50 hover:bg-transparent">
              <TableCell colSpan={4} className="text-center p-6 text-nba-gray">No hay equipos registrados.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeamTable;
