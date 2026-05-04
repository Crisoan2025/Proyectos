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
import useApi from '../hooks/useApi';

const ScoreboardRibbon = () => {
  const { data: partidos, reload } = useApi('/partidos');

  useEffect(() => {
    reload();
  }, [reload]);

  if (!partidos || partidos.length === 0) return null;

  return (
    <div className="scoreboard-ribbon">
      <div className="scoreboard-ribbon__track">
        {partidos.map((p) => (
          <div key={p.id} className="scoreboard-card">
            <div className="scoreboard-card__status">
              {p.status === 'jugado' ? (
                <span className="scoreboard-badge scoreboard-badge--final">FINAL</span>
              ) : (
                <span className="scoreboard-badge scoreboard-badge--scheduled">
                  {p.match_date ? new Date(p.match_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).toUpperCase() : 'TBD'}
                </span>
              )}
            </div>

            <div className="scoreboard-card__team">
              <span className="scoreboard-card__emoji">🏀</span>
              <span className="scoreboard-card__name">{p.local_name || 'Local'}</span>
              <span className={`scoreboard-card__score ${p.status === 'jugado' && p.local_points > p.visitor_points ? 'scoreboard-card__score--winner' : ''}`}>
                {p.status === 'jugado' ? p.local_points : '-'}
              </span>
            </div>

            <div className="scoreboard-card__team">
              <span className="scoreboard-card__emoji">🏀</span>
              <span className="scoreboard-card__name">{p.visitor_name || 'Visitante'}</span>
              <span className={`scoreboard-card__score ${p.status === 'jugado' && p.visitor_points > p.local_points ? 'scoreboard-card__score--winner' : ''}`}>
                {p.status === 'jugado' ? p.visitor_points : '-'}
              </span>
            </div>

            {p.status === 'jugado' && (
              <div className="scoreboard-card__footer">Final</div>
            )}
            {p.status !== 'jugado' && (
              <div className="scoreboard-card__footer">{p.match_time || '20:00'} hs</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreboardRibbon;
