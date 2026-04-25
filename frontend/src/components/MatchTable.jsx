// ============================================================
// MatchTable.jsx — Tabla de fixture y resultados
// ============================================================
// POR QUÉ: La tabla más compleja de Admin.jsx con lógica de
// cargar resultados, editar y borrar partidos.
// PARA QUÉ: Componente que muestra el fixture y permite
// interactuar con cada partido (editar, borrar, cargar score).
// ============================================================

import api from '../services/api';

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
    <div className="card card--extra-wide">
      <h3 className="card-title">🏆 FIXTURE Y RESULTADOS</h3>
      <table>
        <thead>
          <tr>
            <th>Cuándo / Dónde</th>
            <th>Encuentro</th>
            <th>Score</th>
            <th>Opciones</th>
          </tr>
        </thead>
        <tbody>
          {partidos.map((p) => (
            <tr key={p.id}>
              <td className="match-info">
                <strong>{new Date(p.match_date).toLocaleDateString()} - {p.match_time || '20:00'}</strong>
                <br />
                📍 {p.location || 'Estadio Central'}
              </td>
              <td className="text-center">
                <div className="match-team">{p.local_name}</div>
                <div className={`match-score ${p.status === 'jugado' ? 'match-score--played' : ''}`}>
                  {p.status === 'jugado' ? `${p.local_points} - ${p.visitor_points}` : 'VS'}
                </div>
                <div className="match-team">{p.visitor_name}</div>
              </td>
              <td className="text-center">
                {p.status !== 'jugado' ? (
                  <button onClick={() => handleCargarResultado(p.id)} className="btn btn-green btn-sm">
                    Cargar
                  </button>
                ) : (
                  <span className="badge-final">FINAL</span>
                )}
              </td>
              <td className="text-center">
                {p.status !== 'jugado' && (
                  <div className="action-buttons">
                    <button onClick={() => onEditMatch(p)} className="btn btn-warning btn-sm">✏️</button>
                    <button onClick={() => handleBorrar(p.id)} className="btn btn-danger btn-sm">🗑️</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {partidos.length === 0 && (
            <tr>
              <td colSpan="4" className="empty-state">No hay partidos programados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MatchTable;
