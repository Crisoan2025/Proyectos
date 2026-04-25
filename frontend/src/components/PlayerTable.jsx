// ============================================================
// PlayerTable.jsx — Tabla de roster / jugadores
// ============================================================
// POR QUÉ: La tabla de jugadores estaba mezclada con la tabla
// de partidos y los formularios dentro de Admin.jsx.
// PARA QUÉ: Componente presentacional que recibe datos por props
// y delega la acción de eliminar al padre.
// ============================================================

import api from '../services/api';

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
    <div className="card card--wide">
      <h3 className="card-title card-title--green">📋 ROSTER</h3>
      <table>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Jugador</th>
            <th>Cat.</th>
            <th style={{ textAlign: 'left' }}>Equipo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {jugadores.map((jug) => (
            <tr key={jug.id}>
              <td className="team-name">{jug.name} {jug.surname}</td>
              <td className="text-center text-small">{jug.category}</td>
              <td className="text-small text-muted">{jug.team_name || 'Agente Libre'}</td>
              <td className="text-center">
                <button onClick={() => handleBorrar(jug.id)} className="btn btn-danger btn-sm">
                  BAJA
                </button>
              </td>
            </tr>
          ))}
          {jugadores.length === 0 && (
            <tr>
              <td colSpan="4" className="empty-state">No hay jugadores registrados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;
