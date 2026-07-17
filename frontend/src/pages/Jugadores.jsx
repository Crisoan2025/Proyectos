// ============================================================
// Jugadores.jsx — Página pública de jugadores
// ============================================================
// POR QUÉ: No existía una vista pública para ver los jugadores.
// PARA QUÉ: Lista todos los jugadores con búsqueda por nombre
// y filtro por categoría. Visible para cualquier usuario.
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { usePlayers } from '../features/players/api/usePlayers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CategoryFilter from '../components/CategoryFilter';

// Valores especiales del filtro de equipo (los ids reales son numéricos)
const TODOS_LOS_EQUIPOS = 'todos';
const AGENTE_LIBRE = 'libre';

const Jugadores = () => {
  const { players: jugadores, loading, error, reload } = usePlayers();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState(TODOS_LOS_EQUIPOS);

  useEffect(() => {
    reload();
  }, [reload]);

  // Equipos únicos derivados de los propios jugadores (sin fetch extra):
  // solo aparecen equipos que tienen al menos un jugador.
  const equipos = useMemo(() => {
    const map = new Map();
    jugadores.forEach((j) => {
      if (j.team_id && !map.has(j.team_id)) map.set(j.team_id, j.team_name);
    });
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [jugadores]);

  // items para el Select de base-ui: sin esto el trigger muestra el value
  // crudo (el id numérico) en vez del nombre del equipo.
  const teamItems = useMemo(() => {
    const items = { [TODOS_LOS_EQUIPOS]: 'Todos los equipos' };
    equipos.forEach((eq) => { items[String(eq.id)] = eq.name; });
    items[AGENTE_LIBRE] = 'Agente Libre';
    return items;
  }, [equipos]);

  // useMemo para no recalcular el filtro en cada render
  const jugadoresFiltrados = useMemo(() => {
    return jugadores.filter((j) => {
      const matchesSearch = `${j.name} ${j.surname}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || j.category === categoryFilter;
      const matchesTeam =
        teamFilter === TODOS_LOS_EQUIPOS ||
        (teamFilter === AGENTE_LIBRE ? !j.team_id : String(j.team_id) === teamFilter);
      return matchesSearch && matchesCategory && matchesTeam;
    });
  }, [jugadores, searchTerm, categoryFilter, teamFilter]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <Card className="flex flex-col sm:flex-row justify-between items-center bg-nba-card py-5 px-6 rounded-lg border-nba-border mb-8 shadow-sm">
        <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-nba-white m-0 mb-4 sm:mb-0">🏃‍♂️ Jugadores de la Liga</h2>
        <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
      </Card>

      {/* Barra de búsqueda */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-nba-dark p-4 rounded-lg border border-nba-border">
        <Input
          type="text"
          placeholder="🔍 Buscar jugador por nombre o apellido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md bg-nba-card border-nba-border text-nba-white placeholder:text-nba-gray"
        />
        {/* Filtro por equipo */}
        <Select value={teamFilter} onValueChange={setTeamFilter} items={teamItems}>
          <SelectTrigger className="w-full sm:w-[220px] bg-nba-card border-nba-border text-nba-white">
            <SelectValue placeholder="Equipo" />
          </SelectTrigger>
          <SelectContent className="bg-nba-card border-nba-border text-nba-white">
            <SelectItem value={TODOS_LOS_EQUIPOS}>Todos los equipos</SelectItem>
            {equipos.map((eq) => (
              <SelectItem key={eq.id} value={String(eq.id)}>{eq.name}</SelectItem>
            ))}
            <SelectItem value={AGENTE_LIBRE}>Agente Libre</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-[0.8rem] font-bold uppercase tracking-wider text-nba-gray shrink-0">
          {jugadoresFiltrados.length} jugador{jugadoresFiltrados.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {loading && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex items-center gap-4 bg-nba-card rounded-lg border-nba-border p-4">
              <Skeleton className="w-12 h-12 rounded-full bg-nba-dark" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[120px] bg-nba-dark" />
                <Skeleton className="h-3 w-[80px] bg-nba-dark" />
              </div>
              <Skeleton className="h-4 w-[40px] bg-nba-dark rounded-full" />
            </Card>
          ))}
        </div>
      )}
      {error && <p className="text-nba-red font-semibold p-6 text-center">❌ Error: {error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {jugadoresFiltrados.map((j) => (
            <Card key={j.id} className="flex items-center gap-4 bg-nba-card rounded-lg border-nba-border p-4 transition-transform hover:-translate-y-1 hover:shadow-md cursor-default">
              {/* Avatar shadcn: muestra la foto si hay photo_url; si no (o si la
                  imagen falla al cargar) cae automáticamente a las iniciales. */}
              <Avatar className="w-12 h-12 shrink-0">
                <AvatarImage src={j.photo_url} alt={`${j.name} ${j.surname}`} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-nba-blue to-nba-dark font-heading font-black text-nba-white tracking-widest shadow-inner">
                  {j.surname?.charAt(0)}{j.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-heading text-base font-black uppercase tracking-wide text-nba-white m-0 truncate">{j.surname}, {j.name}</h3>
                <span className="block text-[0.75rem] text-nba-lightgray mt-1 truncate">
                  {j.team_name || 'Agente Libre'}
                </span>
              </div>
              <Badge variant="secondary" className={`text-[0.65rem] font-bold uppercase tracking-[0.5px] py-0.5 px-2 border-transparent ${j.category === 'Junior' ? 'bg-nba-green/20 text-nba-green hover:bg-nba-green/30' : 'bg-nba-blue/20 text-[#5b8def] hover:bg-nba-blue/30'}`}>
                {j.category || 'N/A'}
              </Badge>
            </Card>
          ))}
        </div>
      )}

      {!loading && jugadoresFiltrados.length === 0 && jugadores.length > 0 && (
        <p className="text-center p-6 text-nba-gray">No se encontraron jugadores con ese filtro</p>
      )}
    </div>
  );
};

export default Jugadores;
