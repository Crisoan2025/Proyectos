// Sección "Jugadores" del panel admin. Ruta: /admin/jugadores
import { useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import PlayerForm from '../../features/players/components/PlayerForm';
import PlayerTable from '../../features/players/components/PlayerTable';

export default function JugadoresSection() {
  const { equipos, jugadores, reloadJugadores } = useOutletContext();
  const playerFormRef = useRef(null);

  const handleEditPlayer = (jugador) => {
    playerFormRef.current?.iniciarEdicion(jugador);
  };

  return (
    <div className="flex gap-4 flex-wrap xl:flex-nowrap items-start">
      <PlayerForm ref={playerFormRef} equipos={equipos} onPlayerSaved={reloadJugadores} />
      <PlayerTable jugadores={jugadores} onPlayerDeleted={reloadJugadores} onEditPlayer={handleEditPlayer} />
    </div>
  );
}
