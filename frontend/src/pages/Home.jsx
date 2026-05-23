import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import PlayoffBracket from '../components/PlayoffBracket';
import { Trophy } from 'lucide-react';

// Datos estáticos de titulares (se reemplazarán por API en el futuro)
const TITULARES = [
  { id: 1, text: 'Toca para ver: Dónde encontrar todos los partidos de los playoffs' },
  { id: 2, text: 'Actualizaciones en vivo: Resultados de la Jornada 3' },
  { id: 3, text: 'El MVP de la temporada será anunciado esta semana' },
  { id: 4, text: 'Nuevas reglas de la liga para la próxima temporada' },
  { id: 5, text: 'Los mejores quintetos de la temporada regular' },
  { id: 6, text: 'El draft de rookies: Jugadores elegibles confirmados' },
  { id: 7, text: 'Estadísticas: Los líderes en puntos, asistencias y rebotes' },
];

const Home = () => {
  const [equipos, setEquipos] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [temporadaActiva, setTemporadaActiva] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar temporadas al montar
  useEffect(() => {
    const fetchTemporadas = async () => {
      try {
        const [resTodas, resActiva] = await Promise.all([
          api.get('/temporadas'),
          api.get('/temporadas/activa'),
        ]);
        const todas = await resTodas.json();
        setTemporadas(todas);

        if (resActiva.ok) {
          const activa = await resActiva.json();
          setTemporadaActiva(activa);
          setSelectedSeason(String(activa.id));
        }
      } catch (err) {
        console.error('Error cargando temporadas:', err);
      }
    };
    fetchTemporadas();
  }, []);

  // Cargar equipos cuando cambia la temporada o categoría seleccionada
  const cargarEquipos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedSeason) params.set('season_id', selectedSeason);
      if (categoryFilter) params.set('category', categoryFilter);
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const res = await api.get(`/equipos${queryString}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setEquipos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason, categoryFilter]);

  useEffect(() => {
    if (selectedSeason) cargarEquipos();
  }, [selectedSeason, categoryFilter, cargarEquipos]);

  // Nombre de la temporada seleccionada
  const selectedSeasonName = temporadas.find(t => String(t.id) === selectedSeason)?.name || 'Liga TPO';

  return (
    <div>
      {/* ============ HERO BANNER ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#1a0a2e] to-[#2a0a1e] before:absolute before:-top-1/2 before:-right-[20%] before:w-[600px] before:h-[600px] before:bg-[radial-gradient(circle,rgba(200,16,46,0.15)_0%,transparent_70%)] before:pointer-events-none after:absolute after:-bottom-[30%] after:-left-[10%] after:w-[500px] after:h-[500px] after:bg-[radial-gradient(circle,rgba(29,66,138,0.12)_0%,transparent_70%)] after:pointer-events-none">
        <div className="relative z-10 py-16 px-10 max-w-7xl mx-auto">
          <div className="max-w-[600px]">
            <span className="inline-flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[2px] text-nba-gold bg-nba-gold/10 border border-nba-gold/30 py-1.5 px-3.5 rounded mb-5">
              <Trophy className="w-4 h-4" />
              {temporadaActiva?.name || 'Liga de Baloncesto'}
            </span>
            <h2 className="font-heading text-5xl font-black leading-tight uppercase tracking-tight text-nba-white mb-4">
              LIGA DE BALONCESTO<br />
              <span className="text-nba-red block">TPO PLAYOFFS</span>
            </h2>
            <p className="text-base text-nba-lightgray leading-relaxed mb-7">
              Seguí la acción en vivo. Standings, fixture y resultados actualizados.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button asChild className="bg-nba-red hover:bg-[#e01535] text-white font-heading font-bold tracking-[1.5px] uppercase py-6 px-7">
                <a href="#standings">VER CLASIFICACIÓN</a>
              </Button>
              <Button asChild variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/5 hover:border-white font-heading font-bold tracking-[1.5px] uppercase py-6 px-7">
                <a href="#standings">FIXTURE COMPLETO</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTENIDO PRINCIPAL (2 columnas) ============ */}
      <div className="max-w-7xl mx-auto py-8 px-6 grid grid-cols-1 md:grid-cols-[1fr_340px] gap-8">

        {/* COLUMNA IZQUIERDA — Standings */}
        <main>
          <Card className="bg-nba-card rounded-lg border-nba-border overflow-hidden" id="standings">
            <div className="flex justify-between items-baseline pt-5 px-6 pb-4 border-b border-nba-border">
              <h2 className="font-heading text-xl font-black uppercase tracking-wide m-0 text-nba-white">Standings</h2>
              <div className="flex items-center gap-2">
                {/* Selector de temporada */}
                {selectedSeason && (
                  <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                    <SelectTrigger className="w-[180px] bg-nba-dark border-nba-border text-nba-lightgray h-8 text-[0.75rem]">
                      <SelectValue placeholder="Temporada" />
                    </SelectTrigger>
                    <SelectContent className="bg-nba-card border-nba-border text-nba-white">
                      {temporadas.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name} {t.is_active ? '(Activa)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Tabs de categoría */}
            <div className="flex items-center px-6 py-3 border-b border-nba-border gap-2 bg-nba-dark/50">
              {['', 'Senior', 'Junior'].map((cat) => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? 'default' : 'outline'}
                  size="sm"
                  className={`h-7 px-4 text-[0.7rem] font-bold uppercase tracking-[0.8px] cursor-pointer transition-all ${categoryFilter === cat ? 'bg-nba-blue hover:bg-nba-blue/90 text-white border-nba-blue' : 'bg-transparent text-nba-gray border-nba-border hover:text-nba-white hover:border-nba-gray hover:bg-transparent'}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat || 'Todos'}
                </Button>
              ))}
              <span className="ml-auto text-[0.75rem] font-bold text-nba-gray uppercase tracking-wider">{selectedSeasonName}</span>
            </div>

            {loading && (
              <div className="p-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4 mb-4 last:mb-0">
                    <Skeleton className="h-6 w-6 bg-nba-dark rounded-full shrink-0" />
                    <Skeleton className="h-4 w-full max-w-[200px] bg-nba-dark" />
                    <Skeleton className="h-4 w-8 bg-nba-dark ml-auto" />
                    <Skeleton className="h-4 w-8 bg-nba-dark" />
                    <Skeleton className="h-4 w-8 bg-nba-dark" />
                  </div>
                ))}
              </div>
            )}
            {error && <p className="text-nba-red font-semibold p-6 text-center">❌ Error: {error}</p>}

            {!loading && !error && (
              <Table className="w-full text-center">
                <TableHeader>
                  <TableRow className="border-b-nba-border hover:bg-transparent">
                    <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] w-10 text-center">#</TableHead>
                    <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] text-left">Equipo</TableHead>
                    <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] text-center">CAT</TableHead>
                    <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] text-center">
                      <Tooltip>
                        <TooltipTrigger className="cursor-help border-b border-dotted border-nba-gray/50 pb-0.5">PJ</TooltipTrigger>
                        <TooltipContent className="bg-nba-card border-nba-border text-nba-white text-[0.7rem] font-bold">
                          Partidos Jugados
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] text-center">
                      <Tooltip>
                        <TooltipTrigger className="cursor-help border-b border-dotted border-nba-gray/50 pb-0.5 text-nba-green">W</TooltipTrigger>
                        <TooltipContent className="bg-nba-card border-nba-border text-nba-white text-[0.7rem] font-bold">
                          Victorias (Won)
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] text-center">
                      <Tooltip>
                        <TooltipTrigger className="cursor-help border-b border-dotted border-nba-gray/50 pb-0.5 text-nba-red">L</TooltipTrigger>
                        <TooltipContent className="bg-nba-card border-nba-border text-nba-white text-[0.7rem] font-bold">
                          Derrotas (Lost)
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] text-center">
                      <Tooltip>
                        <TooltipTrigger className="cursor-help border-b border-dotted border-nba-gray/50 pb-0.5">E</TooltipTrigger>
                        <TooltipContent className="bg-nba-card border-nba-border text-nba-white text-[0.7rem] font-bold">
                          Empates
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="text-nba-gray uppercase tracking-widest text-[0.7rem] text-center">
                      <Tooltip>
                        <TooltipTrigger className="cursor-help border-b border-dotted border-nba-gray/50 pb-0.5">DIF</TooltipTrigger>
                        <TooltipContent className="bg-nba-card border-nba-border text-nba-white text-[0.7rem] font-bold">
                          Diferencia de Puntos
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="text-nba-gold uppercase tracking-widest text-[0.7rem] text-center">PTS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipos.map((equipo, index) => (
                    <TableRow key={equipo.id} className="transition-colors hover:bg-white/5 border-b-nba-border/50 border-t-0">
                      <TableCell className="text-nba-gray text-[0.8rem] font-bold text-center">{index + 1}</TableCell>
                      <TableCell className="text-left font-bold text-nba-white uppercase text-[0.85rem]">
                        {equipo.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className={`text-[0.65rem] font-bold uppercase tracking-[0.5px] border-transparent rounded-sm ${equipo.category === 'Junior' ? 'bg-nba-green/20 text-nba-green hover:bg-nba-green/30' : 'bg-nba-blue/20 text-[#5b8def] hover:bg-nba-blue/30'}`}>
                          {equipo.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-[0.9rem] text-nba-lightgray">{equipo.played}</TableCell>
                      <TableCell className="text-center text-[0.9rem] text-nba-green font-bold">{equipo.won}</TableCell>
                      <TableCell className="text-center text-[0.9rem] text-nba-red font-bold">{equipo.lost}</TableCell>
                      <TableCell className="text-center text-[0.9rem] text-nba-lightgray">{equipo.tied}</TableCell>
                      <TableCell className={`text-center text-[0.9rem] ${equipo.goal_difference > 0 ? 'text-nba-green font-bold' : equipo.goal_difference < 0 ? 'text-nba-red' : 'text-nba-lightgray'}`}>
                        {equipo.goal_difference > 0 ? '+' : ''}{equipo.goal_difference}
                      </TableCell>
                      <TableCell className="text-center font-black text-[1.1rem] text-nba-gold">{equipo.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!loading && equipos.length === 0 && (
              <p className="text-center p-6 text-nba-gray">No hay equipos en esta categoría/temporada</p>
            )}
          </Card>
        </main>

        {/* COLUMNA DERECHA — Titulares */}
        <aside>
          <Card className="bg-nba-card rounded-lg border-nba-border overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center p-5 pb-4 border-b border-nba-border space-y-0">
              <CardTitle className="font-heading text-lg font-black tracking-wide m-0 text-nba-white">TITULARES</CardTitle>
              <span className="text-[0.75rem] text-nba-blue cursor-pointer hover:text-[#3a6ad4] transition-colors">Ver más</span>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="m-0 p-0 list-none">
                {TITULARES.map((noticia) => (
                  <li key={noticia.id} className="border-b border-nba-border last:border-none hover:bg-white/5 transition-colors">
                    <a href="#" className="block py-4 px-6 text-[0.85rem] text-nba-lightgray leading-relaxed hover:text-nba-white transition-colors">{noticia.text}</a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* ============ BRACKET DE PLAYOFFS (ancho completo) ============ */}
      {!loading && !error && equipos.length >= 8 && (
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <PlayoffBracket equipos={equipos} />
        </div>
      )}
    </div>
  );
};

export default Home;