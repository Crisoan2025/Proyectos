// ============================================================
// ScoreboardRibbon.jsx — Cinta de marcadores estilo NBA
// ============================================================
// POR QUÉ: La web de la NBA tiene una barra horizontal justo
// debajo del navbar que muestra todos los partidos del día con
// sus marcadores en tiempo real y scroll horizontal.
// PARA QUÉ: Replica ese patrón visual usando nuestros datos
// de partidos, dando información instantánea al usuario.
// ============================================================

import { useEffect } from 'react';
import useApi from '../../../hooks/useApi';

const ScoreboardRibbon = () => {
  const { data: partidos, reload } = useApi('/partidos');

  useEffect(() => {
    reload();
  }, [reload]);

  if (!partidos || partidos.length === 0) return null;

  return (
    <div className="bg-nba-dark border-b border-nba-border overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-nba-border [&::-webkit-scrollbar-thumb]:rounded">
      <div className="flex gap-px p-0 min-w-max">
        {partidos.map((p) => (
          <div key={p.id} className="bg-nba-card py-2.5 px-5 min-w-[180px] border-r border-nba-border transition-colors hover:bg-[#262626] cursor-pointer">
            <div className="mb-1.5">
              {p.status === 'jugado' ? (
                <span className="text-[0.6rem] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm text-nba-red">FINAL</span>
              ) : (
                <span className="text-[0.6rem] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm text-nba-gray">
                  {p.match_date ? new Date(p.match_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).toUpperCase() : 'TBD'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 py-0.5">
              <span className="text-sm">🏀</span>
              <span className="flex-1 text-xs font-semibold text-nba-lightgray truncate">{p.local_name || 'Local'}</span>
              <span className={`text-[0.85rem] font-bold min-w-[24px] text-right ${p.status === 'jugado' && p.local_points > p.visitor_points ? 'text-nba-white' : 'text-nba-gray'}`}>
                {p.status === 'jugado' ? p.local_points : '-'}
              </span>
            </div>

            <div className="flex items-center gap-2 py-0.5">
              <span className="text-sm">🏀</span>
              <span className="flex-1 text-xs font-semibold text-nba-lightgray truncate">{p.visitor_name || 'Visitante'}</span>
              <span className={`text-[0.85rem] font-bold min-w-[24px] text-right ${p.status === 'jugado' && p.visitor_points > p.local_points ? 'text-nba-white' : 'text-nba-gray'}`}>
                {p.status === 'jugado' ? p.visitor_points : '-'}
              </span>
            </div>

            {p.status === 'jugado' && (
              <div className="text-[0.65rem] text-nba-gray mt-1.5 uppercase tracking-wide">Final</div>
            )}
            {p.status !== 'jugado' && (
              <div className="text-[0.65rem] text-nba-gray mt-1.5 uppercase tracking-wide">{p.match_time || '20:00'} hs</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreboardRibbon;
