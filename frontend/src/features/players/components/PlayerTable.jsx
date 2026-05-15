// ============================================================
// PlayerTable.jsx — Tabla de roster / jugadores
// ============================================================
// POR QUÉ: La tabla de jugadores estaba mezclada con la tabla
// de partidos y los formularios dentro de Admin.jsx.
// PARA QUÉ: Componente presentacional que recibe datos por props
// y delega la acción de eliminar al padre.
// ============================================================

import api from '../../../services/api';

const PlayerTable = ({ jugadores, onPlayerDeleted }) => {

  const handleBorrar = async (id) => {
    if (!window.confirm('¿Dar de baja a este jugador?')) return;
    try {
      await api.del(`/jugadores/${id}`);
      onPlayerDeleted();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-nba-card p-6 rounded-lg border border-nba-border flex-1 min-w-[400px] overflow-x-auto">
      <h3 className="font-heading text-base font-bold tracking-wide m-0 mb-4 pb-2.5 border-b-2 border-nba-green text-nba-white block">📋 ROSTER</h3>
      <table className="w-full border-collapse bg-transparent mt-3">
        <thead>
          <tr className="bg-white/5 border-b border-nba-border">
            <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest p-3 text-left">Jugador</th>
            <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest p-3">Cat.</th>
            <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest p-3 text-left">Equipo</th>
            <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest p-3"></th>
          </tr>
        </thead>
        <tbody>
          {jugadores.map((jug) => (
            <tr key={jug.id} className="transition-colors hover:bg-white/5">
              <td className="p-3 border-b border-nba-border/50 text-[0.85rem] font-bold uppercase text-nba-white text-left">{jug.name} {jug.surname}</td>
              <td className="p-3 border-b border-nba-border/50 text-center text-[0.75rem] text-nba-lightgray">{jug.category}</td>
              <td className="p-3 border-b border-nba-border/50 text-[0.75rem] text-nba-gray text-left">{jug.team_name || 'Agente Libre'}</td>
              <td className="p-3 border-b border-nba-border/50 text-center">
                <button onClick={() => handleBorrar(jug.id)} className="font-body font-bold text-[0.7rem] uppercase tracking-[0.8px] py-1.5 px-3 rounded border-none cursor-pointer text-white transition-all bg-[#d32f2f] hover:-translate-y-px">
                  BAJA
                </button>
              </td>
            </tr>
          ))}
          {jugadores.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center p-6 text-nba-gray border-b border-nba-border/50">No hay jugadores registrados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;
