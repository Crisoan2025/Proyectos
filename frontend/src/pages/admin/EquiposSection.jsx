// Sección "Equipos" del panel admin. Ruta: /admin/equipos
import { useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import TeamForm from '../../features/teams/components/TeamForm';
import TeamTable from '../../features/teams/components/TeamTable';

export default function EquiposSection() {
  const { equipos, reloadEquipos, reloadPartidos } = useOutletContext();
  const teamFormRef = useRef(null);

  // Al guardar (alta o edición) recargamos equipos y también partidos,
  // para que el fixture refleje un nombre de equipo editado.
  const handleTeamSaved = () => {
    reloadEquipos();
    reloadPartidos();
  };

  const handleEditTeam = (equipo) => {
    teamFormRef.current?.iniciarEdicion(equipo);
  };

  return (
    <div className="flex gap-4 flex-wrap xl:flex-nowrap items-start">
      <TeamForm ref={teamFormRef} onTeamSaved={handleTeamSaved} />
      <TeamTable equipos={equipos} onTeamDeleted={reloadEquipos} onEditTeam={handleEditTeam} />
    </div>
  );
}
