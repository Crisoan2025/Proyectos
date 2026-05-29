// ============================================================
// Login.jsx — Página de acceso restringido
// ============================================================
// POR QUÉ: Accedía a localStorage directamente y tenía la URL
// del backend hardcodeada. Estilos inline en todo el formulario.
// PARA QUÉ: Ahora usa AuthContext (login centralizado),
// el servicio api.js y clases CSS del design system.
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../../../services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 🔧 CORRECCIÓN (Bug #2): pasamos { redirectOn401: false } para que un 401 de
      // credenciales NO recargue la página; así el error se muestra acá mismo.
      const response = await api.post('/auth/login', { email, password }, false, { redirectOn401: false });
      const data = await response.json();

      if (response.ok) {
        // Usamos el contexto centralizado en vez de localStorage directo
        login(data.token);
        navigate('/admin');
      } else {
        // 🔧 CORRECCIÓN (Bug #2): el backend responde { error }, no { message }.
        // Antes leíamos data.message (siempre undefined) y se perdía el detalle real
        // (p. ej. el aviso de "demasiados intentos" del rate-limit 429).
        setError(data.error || data.message || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Falla de conexión con el servidor. ¿Está prendido Node?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[420px] mx-auto mt-20 mb-20 p-10 bg-nba-card rounded-xl border border-nba-border text-center shadow-lg">
      <h2 className="font-heading text-3xl font-black uppercase tracking-wide text-nba-white mb-2">🔑 Acceso Restringido</h2>
      <p className="text-nba-gray text-[0.9rem] mb-6">Ingresá tus credenciales de Administrador</p>
      
      <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
        <Input 
          type="email" 
          placeholder="Tu correo (ej: admin@tpo.com)" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-nba-dark border-nba-border text-nba-white placeholder:text-nba-gray"
        />
        <Input 
          type="password" 
          placeholder="Tu contraseña secreta" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-nba-dark border-nba-border text-nba-white placeholder:text-nba-gray"
        />
        <Button type="submit" className="w-full bg-nba-red hover:bg-nba-red/90 text-white font-body font-bold tracking-widest mt-2" disabled={loading}>
          {loading ? 'Verificando...' : 'ENTRAR AL PANEL VIP'}
        </Button>
      </form>

      {error && <p className="text-nba-red font-semibold mt-4 text-sm">❌ {error}</p>}
    </div>
  );
};

export default Login;