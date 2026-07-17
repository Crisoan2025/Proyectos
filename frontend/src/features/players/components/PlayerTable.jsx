// ============================================================
// PlayerTable.jsx — Tabla de roster / jugadores
// ============================================================
// POR QUÉ: La tabla de jugadores estaba mezclada con la tabla
// de partidos y los formularios dentro de Admin.jsx.
// PARA QUÉ: Componente presentacional que recibe datos por props
// y delega la acción de eliminar al padre.
// ============================================================

import api from '../../../services/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Edit2, Trash2 } from 'lucide-react';

const PlayerTable = ({ jugadores, onPlayerDeleted, onEditPlayer }) => {

  const handleBorrar = async (id) => {
    try {
      // Chequeamos res.ok para no mostrar "éxito" si el backend rechazó la baja.
      const res = await api.del(`/jugadores/${id}`);
      if (res.ok) {
        toast.success('Jugador dado de baja exitosamente');
        onPlayerDeleted();
      } else {
        const data = await res.json();
        toast.error(`Error: ${data.error || 'No se pudo dar de baja al jugador'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al dar de baja al jugador');
    }
  };

  return (
    <div className="bg-nba-card p-6 rounded-lg border border-nba-border flex-1 min-w-0 w-full overflow-x-auto">
      <div className="flex items-center gap-2 mb-4 pb-2.5 border-b-2 border-nba-green">
        <Users className="w-5 h-5 text-nba-green" />
        <h3 className="font-heading text-base font-bold tracking-wide m-0 text-nba-white block">ROSTER</h3>
      </div>
      {/* [&_td]:whitespace-normal: permite quebrar línea en nombres largos
          para que la tabla no desborde con scroll horizontal. */}
      <Table className="mt-3 [&_td]:whitespace-normal">
        <TableHeader>
          <TableRow className="border-nba-border hover:bg-transparent">
            <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem]">Jugador</TableHead>
            <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] text-center">Cat.</TableHead>
            <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem]">Equipo</TableHead>
            <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] text-center">Opciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jugadores.map((jug) => (
            <TableRow key={jug.id} className="border-nba-border/50 hover:bg-white/5 transition-colors">
              <TableCell className="font-bold uppercase text-nba-white text-[0.85rem]">{jug.name} {jug.surname}</TableCell>
              <TableCell className="text-center text-[0.75rem] text-nba-lightgray">{jug.category}</TableCell>
              <TableCell className="text-[0.75rem] text-nba-gray">{jug.team_name || 'Agente Libre'}</TableCell>
              <TableCell className="text-center">
                <div className="flex gap-1.5 justify-center">
                  <Button onClick={() => onEditPlayer(jug)} size="sm" className="bg-nba-gold hover:bg-nba-gold/80 text-black font-body font-bold text-[0.7rem] uppercase tracking-[0.8px] h-7 w-9 p-0 flex items-center justify-center">
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
                        <AlertDialogTitle>¿Dar de baja a este jugador?</AlertDialogTitle>
                        <AlertDialogDescription className="text-nba-lightgray">
                          Se eliminará permanentemente de su equipo y del sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-nba-border text-nba-white hover:bg-white/5 hover:text-white">Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-nba-red text-white hover:bg-nba-red/90" onClick={() => handleBorrar(jug.id)}>Confirmar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {jugadores.length === 0 && (
            <TableRow className="border-nba-border/50 hover:bg-transparent">
              <TableCell colSpan={4} className="text-center p-6 text-nba-gray">No hay jugadores registrados.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PlayerTable;
