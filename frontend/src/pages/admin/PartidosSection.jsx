// Sección "Partidos" del panel admin. Ruta: /admin/partidos
// Toma la data compartida del layout (Admin) vía useOutletContext.
import { useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import MatchForm from '../../features/matches/components/MatchForm';
import MatchTable from '../../features/matches/components/MatchTable';

export default function PartidosSection() {
  const { equipos, partidos, reloadPartidos, reloadEquipos } = useOutletContext();
  const matchFormRef = useRef(null);

  // Al guardar un resultado o reprogramar, recargamos partidos y equipos
  // (los puntos del fixture impactan en la tabla de posiciones).
  const handleMatchUpdated = () => {
    reloadPartidos();
    reloadEquipos();
  };

  const handleEditMatch = (partido) => {
    matchFormRef.current?.iniciarEdicion(partido);
  };

  return (
    <div className="flex gap-4 flex-wrap xl:flex-nowrap items-start">
      <MatchForm ref={matchFormRef} equipos={equipos} onMatchSaved={handleMatchUpdated} />
      <MatchTable partidos={partidos} onMatchUpdated={handleMatchUpdated} onEditMatch={handleEditMatch} />
    </div>
  );
}
