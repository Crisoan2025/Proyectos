// ============================================================
// NavigationBar.jsx — Barra de navegación estilo NBA
// ============================================================
// Rediseñada para replicar la barra superior de nba.com:
// - Fondo negro puro con enlaces blancos en mayúscula
// - Logo/nombre a la izquierda
// - Links de navegación centrados
// - Botón de acción dorado (League Pass style) a la derecha
//
// 🔧 AMPLIACIÓN:
// - Menú hamburguesa en mobile (shadcn <Sheet>): antes los links
//   centrales eran hidden md:flex y en celular desaparecían sin
//   reemplazo — no había forma de navegar.
// - Menú de usuario (shadcn <DropdownMenu>) cuando hay sesión:
//   antes "Cerrar sesión" solo existía dentro del panel admin;
//   desde las páginas públicas no había forma de desloguearse.
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Settings, LogOut, UserRound } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/#standings', label: 'Clasificación' },
  { to: '/equipos', label: 'Equipos' },
  { to: '/jugadores', label: 'Jugadores' },
];

const NavigationBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-nba-black border-b border-nba-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Hamburguesa (solo mobile) + Logo */}
        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Abrir menú de navegación"
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded text-nba-lightgray hover:text-nba-white hover:bg-white/5 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="bg-nba-black border-r border-nba-border text-nba-white w-72 p-0">
              <SheetHeader className="p-4 border-b border-nba-border">
                <SheetTitle className="flex items-center gap-2.5 text-nba-white">
                  <span className="text-2xl">🏀</span>
                  <span className="font-heading font-black text-xl tracking-widest">LIGA TPO</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-2">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded text-sm font-semibold uppercase tracking-wider text-nba-lightgray hover:text-nba-white hover:bg-white/5 transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="border-t border-nba-border my-2" />
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="mx-2 my-1 text-center text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded bg-nba-gold text-nba-black hover:bg-[#ffb340] transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="mx-2 my-1 text-center text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded bg-nba-gold text-nba-black hover:bg-[#ffb340] transition-colors"
                    >
                      ⚙️ Panel VIP
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="mx-2 my-1 text-center text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded bg-[#d32f2f]/10 text-[#ff5252] hover:bg-[#d32f2f]/20 transition-colors cursor-pointer"
                    >
                      Cerrar sesión
                    </button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🏀</span>
            <span className="font-heading font-black text-xl tracking-widest text-nba-white">LIGA TPO</span>
          </Link>
        </div>

        {/* Links centrales (desktop) */}
        <div className="hidden md:flex gap-7">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-xs font-semibold uppercase tracking-wider text-nba-lightgray hover:text-nba-white transition-colors py-4 border-b-2 border-transparent hover:border-nba-red"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Acciones (derecha) */}
        <div className="flex items-center gap-2.5">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="hidden sm:inline-block text-xs font-bold uppercase tracking-wide px-4 py-2 rounded transition-all cursor-pointer bg-nba-gold text-nba-black hover:bg-[#ffb340] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(249,160,27,0.4)]">
                Pase de Liga
              </Link>
              <Link to="/login" className="text-xs font-bold uppercase tracking-wide px-4 py-2 rounded transition-all cursor-pointer border border-nba-gray text-nba-white hover:border-nba-white hover:bg-white/5">
                Iniciar sesión
              </Link>
            </>
          ) : (
            <>
              <Link to="/admin" className="hidden sm:inline-block text-xs font-bold uppercase tracking-wide px-4 py-2 rounded transition-all cursor-pointer bg-nba-gold text-nba-black hover:bg-[#ffb340] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(249,160,27,0.4)]">
                ⚙️ Panel VIP
              </Link>
              {/* Menú de cuenta: única vía de logout fuera del admin */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Menú de cuenta"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-nba-border text-nba-lightgray hover:text-nba-white hover:border-nba-gray hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <UserRound className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-nba-card border-nba-border text-nba-white min-w-44">
                  {/* Base UI exige que GroupLabel viva dentro de un Group */}
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-nba-gray text-[0.65rem] font-bold uppercase tracking-widest">
                      Administrador
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-nba-border" />
                  <DropdownMenuItem
                    onClick={() => navigate('/admin')}
                    className="text-nba-lightgray focus:bg-white/5 focus:text-nba-white cursor-pointer text-xs font-bold uppercase tracking-wide"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Panel VIP
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-[#ff5252] focus:bg-[#d32f2f]/15 focus:text-[#ff5252] cursor-pointer text-xs font-bold uppercase tracking-wide"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
