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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Jugadores = () => {
  const { players: jugadores, loading, error, reload } = usePlayers();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    reload();
  }, [reload]);

  // useMemo para no recalcular el filtro en cada render
  const jugadoresFiltrados = useMemo(() => {
    return jugadores.filter((j) => {
      const matchesSearch = `${j.name} ${j.surname}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || j.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [jugadores, searchTerm, categoryFilter]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <Card className="flex flex-col sm:flex-row justify-between items-center bg-nba-card py-5 px-6 rounded-lg border-nba-border mb-8 shadow-sm">
        <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-nba-white m-0 mb-4 sm:mb-0">🏃‍♂️ Jugadores de la Liga</h2>
        <div className="flex gap-2">
          {['', 'Senior', 'Junior'].map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'default' : 'outline'}
              className={`px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.8px] cursor-pointer transition-all ${categoryFilter === cat ? 'bg-nba-blue hover:bg-nba-blue/90 text-white border-nba-blue' : 'bg-transparent text-nba-gray border-nba-border hover:text-nba-white hover:border-nba-gray hover:bg-transparent'}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat || 'Todos'}
            </Button>
          ))}
        </div>
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
        <span className="text-[0.8rem] font-bold uppercase tracking-wider text-nba-gray">
          {jugadoresFiltrados.length} jugador{jugadoresFiltrados.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {loading && <p className="text-nba-blue font-semibold p-6 text-center">Cargando jugadores...</p>}
      {error && <p className="text-nba-red font-semibold p-6 text-center">❌ Error: {error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {jugadoresFiltrados.map((j) => (
            <Card key={j.id} className="flex items-center gap-4 bg-nba-card rounded-lg border-nba-border p-4 transition-transform hover:-translate-y-1 hover:shadow-md cursor-default">
              <div className="w-12 h-12 bg-gradient-to-br from-nba-blue to-nba-dark rounded-full flex items-center justify-center font-heading font-black text-nba-white tracking-widest shrink-0 shadow-inner">
                {j.surname?.charAt(0)}{j.name?.charAt(0)}
              </div>
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
