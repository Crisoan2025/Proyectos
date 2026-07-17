// Sección "Liga" del panel admin. Ruta: /admin/liga
// Edita el branding global de la liga (nombre + logo) en la tabla settings.
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSettings } from '../../features/settings/SettingsContext';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trophy, Save } from 'lucide-react';

export default function LigaSection() {
  const { settings, reloadSettings } = useSettings();
  const [nombre, setNombre] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Precargar con lo que ya hay en la DB cuando llega el contexto.
  useEffect(() => {
    setNombre(settings.league_name || '');
    setLogoUrl(settings.league_logo_url || '');
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return toast.error('El nombre de la liga es obligatorio.');

    setGuardando(true);
    try {
      const res = await api.put('/settings', {
        league_name: nombre,
        league_logo_url: logoUrl || null,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Configuración de la liga actualizada');
        reloadSettings(); // refresca navbar/hero en vivo
      } else {
        toast.error(`Error: ${data.error || 'No se pudo guardar'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="max-w-2xl w-full bg-nba-card p-6 rounded-lg border border-nba-border">
        <div className="flex items-center gap-2 mb-4 pb-2.5 border-b-2 border-nba-gold">
          <Trophy className="w-5 h-5 text-nba-gold" />
          <h3 className="font-heading text-base font-bold tracking-wide m-0 text-nba-white block">IDENTIDAD DE LA LIGA</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="league-name" className="text-nba-gray text-[0.7rem] font-bold uppercase tracking-wider">Nombre de la liga</Label>
            <Input
              id="league-name"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="bg-nba-dark border-nba-border text-nba-white placeholder:text-nba-gray"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="league-logo" className="text-nba-gray text-[0.7rem] font-bold uppercase tracking-wider">URL del logo (opcional)</Label>
            <Input
              id="league-logo"
              type="url"
              placeholder="https://.../logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="bg-nba-dark border-nba-border text-nba-white placeholder:text-nba-gray"
            />
          </div>

          {/* Vista previa del logo */}
          <div className="flex items-center gap-3 bg-nba-dark rounded-lg p-3 border border-nba-border">
            <span className="text-[0.7rem] font-bold text-nba-gray uppercase tracking-wider">Vista previa:</span>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo de la liga"
                className="w-10 h-10 rounded object-contain bg-white/5"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <span className="text-2xl">🏀</span>
            )}
            <span className="font-heading font-black text-nba-white tracking-widest">{nombre || 'LIGA TPO'}</span>
          </div>

          <Button type="submit" disabled={guardando} className="bg-nba-gold hover:bg-nba-gold/90 text-black font-body font-bold text-[0.8rem] uppercase tracking-[0.8px] flex items-center gap-2">
            <Save className="w-4 h-4" />
            {guardando ? 'GUARDANDO...' : 'GUARDAR IDENTIDAD'}
          </Button>
        </form>
      </div>
    </div>
  );
}
