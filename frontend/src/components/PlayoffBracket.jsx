// ============================================================
// PlayoffBracket.jsx — Bracket visual de playoffs
// ============================================================
// Toma los equipos ordenados por puntos del standings y genera
// un bracket visual de Cuartos → Semis → Final.
// Seeding: 1v8, 4v5 (izq) | 2v7, 3v6 (der)
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

// Línea conectora horizontal
const Connector = ({ side = 'right' }) => (
  <div className={`hidden md:flex items-center ${side === 'left' ? 'justify-start' : 'justify-end'}`}>
    <div className="w-4 h-px bg-nba-border/60"></div>
  </div>
);

const PlayoffBracket = ({ equipos = [] }) => {
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

  // Seeding del bracket
  const qf = {
    leftTop:    { seedA: 1, teamA: top8[0], seedB: 8, teamB: top8[7] },
    leftBottom: { seedA: 4, teamA: top8[3], seedB: 5, teamB: top8[4] },
    rightTop:   { seedA: 2, teamA: top8[1], seedB: 7, teamB: top8[6] },
    rightBottom:{ seedA: 3, teamA: top8[2], seedB: 6, teamB: top8[5] },
  };

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
          <Matchup {...qf.leftTop} />
          <Matchup {...qf.leftBottom} />
        </div>

        {/* Columna 2: Semifinal Izquierda */}
        <div className="flex flex-col justify-center h-full">
          <Matchup
            seedA=""
            teamA={null}
            seedB=""
            teamB={null}
            className="border-dashed border-nba-border/50"
          />
          <p className="text-center text-[0.55rem] text-nba-gray uppercase tracking-wider mt-1.5">Por definir</p>
        </div>

        {/* Columna 3: Final */}
        <div className="flex flex-col justify-center h-full">
          <div className="text-center mb-2">
            <span className="text-xl">🏆</span>
          </div>
          <Matchup
            seedA=""
            teamA={null}
            seedB=""
            teamB={null}
            className="border-nba-gold/50 border-dashed shadow-[0_0_15px_rgba(255,215,0,0.05)]"
          />
          <p className="text-center text-[0.55rem] text-nba-gold uppercase tracking-wider mt-1.5 font-bold">Gran Final</p>
        </div>

        {/* Columna 4: Semifinal Derecha */}
        <div className="flex flex-col justify-center h-full">
          <Matchup
            seedA=""
            teamA={null}
            seedB=""
            teamB={null}
            className="border-dashed border-nba-border/50"
          />
          <p className="text-center text-[0.55rem] text-nba-gray uppercase tracking-wider mt-1.5">Por definir</p>
        </div>

        {/* Columna 5: Cuartos Derecha */}
        <div className="flex flex-col justify-between h-full gap-6 py-2">
          <Matchup {...qf.rightTop} />
          <Matchup {...qf.rightBottom} />
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
