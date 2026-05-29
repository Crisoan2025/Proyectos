// ============================================================
// Login.jsx — Página de acceso restringido
// ============================================================
// POR QUÉ: Accedía a localStorage directamente y tenía la URL
// del backend hardcodeada. Estilos inline en todo el formulario.
// PARA QUÉ: Ahora usa AuthContext (login centralizado),
// el servicio api.js y clases CSS del design system.
//
// 🎨 REDISEÑO (bloque shadcn login-01): adoptamos la estructura del
//   bloque oficial "login-01" (Card + CardHeader/Title/Description +
//   campos con Label asociado), adaptada a la paleta NBA. La LÓGICA de
//   auth (AuthContext, api.post con redirectOn401:false, manejo de error
//   y rate-limit) se conserva intacta. Sumar <Label htmlFor> mejora la
//   accesibilidad respecto del form anterior, que solo usaba placeholder.
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="flex min-h-[80vh] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="bg-nba-card border border-nba-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl font-black uppercase tracking-wide text-nba-white">
              🔑 Acceso Restringido
            </CardTitle>
            <CardDescription className="text-nba-gray">
              Ingresá tus credenciales de Administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="flex flex-col gap-5 text-left">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-nba-lightgray uppercase text-[0.7rem] font-bold tracking-wider">
                  Correo
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@tpo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-nba-dark border-nba-border text-nba-white placeholder:text-nba-gray"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-nba-lightgray uppercase text-[0.7rem] font-bold tracking-wider">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-nba-dark border-nba-border text-nba-white placeholder:text-nba-gray"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-nba-red hover:bg-nba-red/90 text-white font-body font-bold tracking-widest mt-1"
              >
                {loading ? 'Verificando...' : 'ENTRAR AL PANEL VIP'}
              </Button>
              {error && <p className="text-nba-red font-semibold text-sm text-center">❌ {error}</p>}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
