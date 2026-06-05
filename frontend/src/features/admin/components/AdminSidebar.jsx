import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { CalendarDays, Users, ShieldPlus, Calendar, Settings, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export function AdminSidebar({ temporadaActiva }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Sección activa según la URL (/admin/equipos -> "equipos").
  const activeSection = location.pathname.split('/')[2] || 'partidos';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const menuItems = [
    { id: 'partidos', title: 'Partidos', icon: CalendarDays },
    { id: 'jugadores', title: 'Jugadores', icon: Users },
    { id: 'equipos', title: 'Equipos', icon: ShieldPlus },
    { id: 'temporadas', title: 'Temporadas', icon: Calendar },
  ];

  return (
    <Sidebar className="dark bg-[#1E1E1E] border-r border-nba-border text-nba-white">
      <SidebarHeader className="p-4 border-b border-nba-border">
        <div className="flex items-center gap-3">
          <div className="bg-nba-red p-2 rounded text-white">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-black text-white text-lg m-0 leading-tight">PANEL VIP</h2>
            <span className="text-[0.65rem] font-bold text-nba-gold uppercase tracking-widest bg-nba-gold/10 px-1.5 py-0.5 rounded border border-nba-gold/20 inline-flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              {temporadaActiva?.name || 'Sin Temporada'}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#1E1E1E]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-nba-gray font-bold uppercase tracking-widest text-[0.65rem]">Gestión de Torneo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => navigate(`/admin/${item.id}`)}
                    className={`font-bold uppercase tracking-wider text-[0.8rem] h-10 transition-colors ${activeSection === item.id ? 'bg-nba-blue text-white hover:bg-nba-blue/90' : 'text-nba-lightgray hover:bg-white/5 hover:text-white'}`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-nba-gray font-bold uppercase tracking-widest text-[0.65rem]">Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleGoHome}
                  className="font-bold uppercase tracking-wider text-[0.8rem] h-10 text-nba-lightgray hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  <span>Volver al Inicio</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-nba-border bg-[#1E1E1E]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="bg-[#d32f2f]/10 text-[#ff5252] hover:bg-[#d32f2f]/20 hover:text-[#ff5252] font-bold uppercase tracking-wider text-[0.8rem] h-10 flex justify-center">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
