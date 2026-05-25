// ============================================================
// Equipos.jsx — Página pública de equipos
// ============================================================
// POR QUÉ: Los usuarios comunes no tenían forma de ver los
// equipos fuera del panel de admin. El link del navbar no iba
// a ningún lado.
// PARA QUÉ: Muestra todos los equipos con sus stats y al hacer
// click expande el roster (jugadores) de cada equipo.
// ============================================================

import { useState, useEffect } from 'react';
import api from '../services/api';
import useApi from '../hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Equipos = () => {
  const [equipoDetalle, setEquipoDetalle] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const endpoint = `/equipos${categoryFilter ? `?category=${categoryFilter}` : ''}`;
  const { data: equipos, loading, reload: cargarEquipos } = useApi(endpoint);

  useEffect(() => {
    cargarEquipos();
  }, [cargarEquipos]);

  const verDetalle = async (id) => {
    if (equipoDetalle?.id === id) {
      setEquipoDetalle(null);
      return;
    }
    try {
      const res = await api.get(`/equipos/${id}`);
      const data = await res.json();
      setEquipoDetalle(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <Card className="flex flex-col sm:flex-row justify-between items-center bg-nba-card py-5 px-6 rounded-lg border-nba-border mb-8 shadow-sm">
        <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-nba-white m-0 mb-4 sm:mb-0">🏀 Equipos de la Liga</h2>
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

      {loading && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-nba-card rounded-lg border border-nba-border">
              <CardHeader className="p-5 pb-0">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-[50px] h-[50px] rounded-full bg-nba-dark" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-[150px] bg-nba-dark" />
                    <Skeleton className="h-3 w-[80px] bg-nba-dark" />
                  </div>
                </div>
                <Skeleton className="h-4 w-[100px] bg-nba-dark mb-5" />
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <Skeleton className="h-[60px] w-full rounded bg-nba-dark" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
        {equipos.map((equipo) => (
          <Card key={equipo.id} className="bg-nba-card rounded-lg border border-nba-border transition-all cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:border-nba-blue" onClick={() => verDetalle(equipo.id)}>
            <CardHeader className="p-5 pb-0">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl bg-nba-dark w-[50px] h-[50px] rounded-full flex items-center justify-center border border-nba-border">🏀</span>
                <div>
                  <CardTitle className="font-heading text-lg font-black uppercase tracking-wide text-nba-white m-0">{equipo.name}</CardTitle>
                  <span className="text-[0.7rem] font-bold uppercase tracking-wider text-nba-gray">{equipo.category}</span>
                </div>
              </div>
              <div className="text-[0.85rem] text-nba-lightgray mb-5 pb-4 border-b border-nba-border">
                <span className="text-nba-gray font-bold text-[0.7rem] uppercase tracking-wider mr-1">DT:</span> {equipo.coach_name}
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="flex justify-between bg-nba-dark rounded p-3">
                <div className="flex flex-col items-center">
                  <span className="font-black text-lg text-nba-gold">{equipo.points}</span>
                  <span className="text-[0.6rem] font-bold uppercase tracking-wider text-nba-gray mt-1">PTS</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-black text-lg text-nba-green">{equipo.won}</span>
                  <span className="text-[0.6rem] font-bold uppercase tracking-wider text-nba-gray mt-1">W</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-black text-lg text-nba-red">{equipo.lost}</span>
                  <span className="text-[0.6rem] font-bold uppercase tracking-wider text-nba-gray mt-1">L</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-black text-lg text-nba-white">{equipo.played}</span>
                  <span className="text-[0.6rem] font-bold uppercase tracking-wider text-nba-gray mt-1">PJ</span>
                </div>
              </div>

              {/* Detalle expandido con roster */}
              {equipoDetalle?.id === equipo.id && (
                <div className="mt-5 pt-5 border-t border-dashed border-nba-border animate-pulse">
                  <h4 className="font-heading text-[0.85rem] font-black text-nba-white uppercase tracking-wider m-0 mb-3">📋 Roster ({equipoDetalle.jugadores?.length || 0} jugadores)</h4>
                  {equipoDetalle.jugadores && equipoDetalle.jugadores.length > 0 ? (
                    <ul className="list-none m-0 p-0 flex flex-col gap-2">
                      {equipoDetalle.jugadores.map((j) => (
                        <li key={j.id} className="flex justify-between items-center py-1.5 px-3 bg-nba-dark rounded border border-nba-border">
                          <span className="text-[0.8rem] text-nba-lightgray font-semibold">{j.surname}, {j.name}</span>
                          <Badge variant="outline" className="text-[0.65rem] text-nba-gray font-bold uppercase border-nba-border">{j.category}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center p-6 text-nba-gray">Sin jugadores registrados</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && equipos.length === 0 && (
        <p className="text-center p-6 text-nba-gray">No se encontraron equipos para esta categoría</p>
      )}
    </div>
  );
};

export default Equipos;
