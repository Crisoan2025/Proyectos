// ============================================================
// PlayoffBracket.jsx — Bracket visual de playoffs
// ============================================================
// Toma los equipos ordenados por puntos del standings y genera
// un bracket de Cuartos → Semis → Final.
// Seeding: 1v8, 4v5 (izq) | 2v7, 3v6 (der)
//
// 🔧 AMPLIACIÓN (bracket funcional): ahora recibe también los
// partidos de playoffs (matches con phase = cuartos/semis/final).
// Para cada cruce busca el partido jugado entre esos dos equipos
// en la fase correspondiente y hace avanzar al ganador. Los cruces
// sin partido jugado siguen mostrando "Por definir".
// Los partidos de playoffs NO afectan el standings (ver backend).
// ============================================================

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Componente de un enfrentamiento individual
const Matchup = ({ seedA, teamA, seedB, teamB, winner, className = '' }) => {
  const isTeamAWinner = winner && winner === teamA?.id;
  const isTeamBWinner = winner && winner === teamB?.id;

  return (
    <div className={`flex flex-col rounded-md border border-nba-border overflow-hidden bg-nba-dark/60 ${className}`}>
      {/* Equipo A */}
      <div className={`flex items-center gap-2 px-3 py-2.5 border-b border-nba-border/50 transition-colors ${isTeamAWinner ? 'bg-nba-green/10' : ''}`}>
        {seedA && <span className="text-[0.65rem] font-black text-nba-gray w-4 text-center shrink-0">{seedA}</span>}
        <span className={`text-[0.75rem] font-bold uppercase tracking-wide truncate flex-1 ${isTeamAWinner ? 'text-nba-white' : teamA ? 'text-nba-lightgray' : 'text-nba-gray/50'}`}>
          {teamA?.name || 'TBD'}
        </span>
        {isTeamAWinner && <span className="text-nba-green text-[0.6rem]">✓</span>}
      </div>
      {/* Equipo B */}
      <div className={`flex items-center gap-2 px-3 py-2.5 transition-colors ${isTeamBWinner ? 'bg-nba-green/10' : ''}`}>
        {seedB && <span className="text-[0.65rem] font-black text-nba-gray w-4 text-center shrink-0">{seedB}</span>}
        <span className={`text-[0.75rem] font-bold uppercase tracking-wide truncate flex-1 ${isTeamBWinner ? 'text-nba-white' : teamB ? 'text-nba-lightgray' : 'text-nba-gray/50'}`}>
          {teamB?.name || 'TBD'}
        </span>
        {isTeamBWinner && <span className="text-nba-green text-[0.6rem]">✓</span>}
      </div>
    </div>
  );
};

/**
 * Busca el partido JUGADO de una fase que enfrente a estos dos equipos
 * (sin importar quién fue local) y devuelve el equipo ganador, o null
 * si el cruce todavía no se jugó o falta alguno de los equipos.
 */
const encontrarGanador = (teamA, teamB, fase, partidos) => {
  if (!teamA || !teamB) return null;
  const partido = partidos.find(
    (p) =>
      p.phase === fase &&
      p.status === 'jugado' &&
      ((p.local_team_id === teamA.id && p.visitor_team_id === teamB.id) ||
        (p.local_team_id === teamB.id && p.visitor_team_id === teamA.id))
  );
  if (!partido) return null;
  const ganadorId = partido.local_points > partido.visitor_points ? partido.local_team_id : partido.visitor_team_id;
  return ganadorId === teamA.id ? teamA : teamB;
};

const PlayoffBracket = ({ equipos = [], partidos = [] }) => {
  // Necesitamos al menos 8 equipos para armar el bracket
  if (equipos.length < 8) {
    return (
      <Card className="bg-nba-card rounded-lg border-nba-border p-6 mt-6">
        <h2 className="font-heading text-xl font-black uppercase tracking-wide text-nba-white mb-3">🏆 Bracket de Playoffs</h2>
        <p className="text-nba-gray text-sm text-center py-8">
          Se necesitan al menos 8 equipos en la temporada para generar el bracket de playoffs.
        </p>
      </Card>
    );
  }

  // Tomar los top 8 equipos (ya vienen ordenados por puntos)
  const top8 = equipos.slice(0, 8);
  // seed original (1-8) de cada equipo, para arrastrarlo por las rondas
  const seedDe = (team) => (team ? top8.findIndex((t) => t.id === team.id) + 1 : '');

  // ---- Cuartos: seeding por standings + ganador según partido jugado ----
  const qf = {
    leftTop:    { seedA: 1, teamA: top8[0], seedB: 8, teamB: top8[7] },
    leftBottom: { seedA: 4, teamA: top8[3], seedB: 5, teamB: top8[4] },
    rightTop:   { seedA: 2, teamA: top8[1], seedB: 7, teamB: top8[6] },
    rightBottom:{ seedA: 3, teamA: top8[2], seedB: 6, teamB: top8[5] },
  };
  const ganadorQF = {
    leftTop:     encontrarGanador(qf.leftTop.teamA, qf.leftTop.teamB, 'cuartos', partidos),
    leftBottom:  encontrarGanador(qf.leftBottom.teamA, qf.leftBottom.teamB, 'cuartos', partidos),
    rightTop:    encontrarGanador(qf.rightTop.teamA, qf.rightTop.teamB, 'cuartos', partidos),
    rightBottom: encontrarGanador(qf.rightBottom.teamA, qf.rightBottom.teamB, 'cuartos', partidos),
  };

  // ---- Semis: se pueblan con los ganadores de cuartos ----
  const semiIzq = { teamA: ganadorQF.leftTop, teamB: ganadorQF.leftBottom };
  const semiDer = { teamA: ganadorQF.rightTop, teamB: ganadorQF.rightBottom };
  const ganadorSemiIzq = encontrarGanador(semiIzq.teamA, semiIzq.teamB, 'semis', partidos);
  const ganadorSemiDer = encontrarGanador(semiDer.teamA, semiDer.teamB, 'semis', partidos);

  // ---- Final y campeón ----
  const campeon = encontrarGanador(ganadorSemiIzq, ganadorSemiDer, 'final', partidos);

  return (
    <Card className="bg-nba-card rounded-lg border-nba-border p-6 mt-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-nba-border">
        <h2 className="font-heading text-xl font-black uppercase tracking-wide text-nba-white m-0">🏆 Bracket de Playoffs</h2>
        <Badge variant="secondary" className="bg-nba-gold/20 text-nba-gold border-transparent text-[0.65rem] font-bold uppercase tracking-wider hover:bg-nba-gold/30">
          Top 8
        </Badge>
      </div>

      {/* Header de rondas */}
      <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_1fr] gap-3 mb-4">
        <div className="text-center">
          <span className="text-[0.6rem] font-bold text-nba-gray uppercase tracking-[2px]">Cuartos</span>
        </div>
        <div className="text-center">
          <span className="text-[0.6rem] font-bold text-nba-gray uppercase tracking-[2px]">Semis</span>
        </div>
        <div className="text-center">
          <span className="text-[0.6rem] font-bold text-nba-gold uppercase tracking-[2px]">🏆 Final</span>
        </div>
        <div className="text-center">
          <span className="text-[0.6rem] font-bold text-nba-gray uppercase tracking-[2px]">Semis</span>
        </div>
        <div className="text-center">
          <span className="text-[0.6rem] font-bold text-nba-gray uppercase tracking-[2px]">Cuartos</span>
        </div>
      </div>

      {/* Bracket visual */}
      <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_1fr] gap-3 items-center" style={{ minHeight: '220px' }}>

        {/* Columna 1: Cuartos Izquierda */}
        <div className="flex flex-col justify-between h-full gap-6 py-2">
          <Matchup {...qf.leftTop} winner={ganadorQF.leftTop?.id} />
          <Matchup {...qf.leftBottom} winner={ganadorQF.leftBottom?.id} />
        </div>

        {/* Columna 2: Semifinal Izquierda */}
        <div className="flex flex-col justify-center h-full">
          <Matchup
            seedA={seedDe(semiIzq.teamA)}
            teamA={semiIzq.teamA}
            seedB={seedDe(semiIzq.teamB)}
            teamB={semiIzq.teamB}
            winner={ganadorSemiIzq?.id}
            className={semiIzq.teamA && semiIzq.teamB ? '' : 'border-dashed border-nba-border/50'}
          />
          {!ganadorSemiIzq && (
            <p className="text-center text-[0.55rem] text-nba-gray uppercase tracking-wider mt-1.5">Por definir</p>
          )}
        </div>

        {/* Columna 3: Final */}
        <div className="flex flex-col justify-center h-full">
          <div className="text-center mb-2">
            <span className="text-xl">🏆</span>
          </div>
          <Matchup
            seedA={seedDe(ganadorSemiIzq)}
            teamA={ganadorSemiIzq}
            seedB={seedDe(ganadorSemiDer)}
            teamB={ganadorSemiDer}
            winner={campeon?.id}
            className={`border-nba-gold/50 shadow-[0_0_15px_rgba(255,215,0,0.05)] ${ganadorSemiIzq && ganadorSemiDer ? '' : 'border-dashed'}`}
          />
          {campeon ? (
            <p className="text-center text-[0.7rem] text-nba-gold uppercase tracking-wider mt-1.5 font-black">
              👑 Campeón: {campeon.name}
            </p>
          ) : (
            <p className="text-center text-[0.55rem] text-nba-gold uppercase tracking-wider mt-1.5 font-bold">Gran Final</p>
          )}
        </div>

        {/* Columna 4: Semifinal Derecha */}
        <div className="flex flex-col justify-center h-full">
          <Matchup
            seedA={seedDe(semiDer.teamA)}
            teamA={semiDer.teamA}
            seedB={seedDe(semiDer.teamB)}
            teamB={semiDer.teamB}
            winner={ganadorSemiDer?.id}
            className={semiDer.teamA && semiDer.teamB ? '' : 'border-dashed border-nba-border/50'}
          />
          {!ganadorSemiDer && (
            <p className="text-center text-[0.55rem] text-nba-gray uppercase tracking-wider mt-1.5">Por definir</p>
          )}
        </div>

        {/* Columna 5: Cuartos Derecha */}
        <div className="flex flex-col justify-between h-full gap-6 py-2">
          <Matchup {...qf.rightTop} winner={ganadorQF.rightTop?.id} />
          <Matchup {...qf.rightBottom} winner={ganadorQF.rightBottom?.id} />
        </div>

      </div>

      {/* Leyenda */}
      <div className="mt-5 pt-3 border-t border-nba-border/50 flex items-center gap-4 flex-wrap">
        <span className="text-[0.6rem] text-nba-gray uppercase tracking-wider">Seeding por posición en el ranking</span>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-2 h-2 rounded-full bg-nba-green/50"></div>
          <span className="text-[0.55rem] text-nba-gray">Ganador</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-[1px] border-t border-dashed border-nba-border"></div>
          <span className="text-[0.55rem] text-nba-gray">Por definir</span>
        </div>
      </div>
    </Card>
  );
};

export default PlayoffBracket;
