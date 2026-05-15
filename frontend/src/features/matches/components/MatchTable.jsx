// ============================================================
// MatchTable.jsx — Tabla de fixture y resultados
// ============================================================
// POR QUÉ: La tabla más compleja de Admin.jsx con lógica de
// cargar resultados, editar y borrar partidos.
// PARA QUÉ: Componente que muestra el fixture y permite
// interactuar con cada partido (editar, borrar, cargar score).
// ============================================================

import api from '../../../services/api';

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
      <table className="w-full border-collapse bg-transparent mt-3">
        <thead>
          <tr className="bg-white/5 border-b border-nba-border">
            <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest p-3">Cuándo / Dónde</th>
            <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest p-3">Encuentro</th>
            <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest p-3">Score</th>
            <th className="text-[0.7rem] font-semibold text-nba-gray uppercase tracking-widest p-3">Opciones</th>
          </tr>
        </thead>
        <tbody>
          {partidos.map((p) => (
            <tr key={p.id} className="transition-colors hover:bg-white/5">
              <td className="p-3 border-b border-nba-border/50 text-[0.75rem] text-nba-gray text-center">
                <strong className="text-nba-lightgray">{new Date(p.match_date).toLocaleDateString()} - {p.match_time || '20:00'}</strong>
                <br />
                📍 {p.location || 'Estadio Central'}
              </td>
              <td className="p-3 border-b border-nba-border/50 text-center">
                <div className="font-bold text-[0.85rem] text-nba-white">{p.local_name}</div>
                <div className={`font-black my-1 text-[1.1rem] ${p.status === 'jugado' ? 'text-nba-red' : 'text-nba-gray'}`}>
                  {p.status === 'jugado' ? `${p.local_points} - ${p.visitor_points}` : 'VS'}
                </div>
                <div className="font-bold text-[0.85rem] text-nba-white">{p.visitor_name}</div>
              </td>
              <td className="p-3 border-b border-nba-border/50 text-center">
                {p.status !== 'jugado' ? (
                  <button onClick={() => handleCargarResultado(p.id)} className="font-body font-bold text-[0.7rem] uppercase tracking-[0.8px] py-1.5 px-3 rounded border-none cursor-pointer text-white transition-all bg-nba-green hover:-translate-y-px">
                    Cargar
                  </button>
                ) : (
                  <span className="text-nba-green font-bold text-[0.7rem] uppercase tracking-[1px]">FINAL</span>
                )}
              </td>
              <td className="p-3 border-b border-nba-border/50 text-center">
                {p.status !== 'jugado' && (
                  <div className="flex gap-1.5 justify-center">
                    <button onClick={() => onEditMatch(p)} className="font-body font-bold text-[0.7rem] uppercase tracking-[0.8px] py-1.5 px-3 rounded border-none cursor-pointer text-black transition-all bg-nba-gold hover:-translate-y-px">✏️</button>
                    <button onClick={() => handleBorrar(p.id)} className="font-body font-bold text-[0.7rem] uppercase tracking-[0.8px] py-1.5 px-3 rounded border-none cursor-pointer text-white transition-all bg-[#d32f2f] hover:-translate-y-px">🗑️</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {partidos.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center p-6 text-nba-gray border-b border-nba-border/50">No hay partidos programados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MatchTable;
