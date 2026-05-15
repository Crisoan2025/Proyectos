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
      const response = await api.post('/auth/login', { email, password });
      const data = await response.json();

      if (response.ok) {
        // Usamos el contexto centralizado en vez de localStorage directo
        login(data.token);
        navigate('/admin');
      } else {
        setError(data.message || 'Credenciales incorrectas');
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
      
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input 
          type="email" 
          placeholder="Tu correo (ej: admin@tpo.com)" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-nba-dark border border-nba-border rounded px-4 py-3 text-[0.9rem] text-nba-white font-body transition-all focus:outline-none focus:border-nba-blue focus:ring-4 focus:ring-nba-blue/20 placeholder-nba-gray"
        />
        <input 
          type="password" 
          placeholder="Tu contraseña secreta" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-nba-dark border border-nba-border rounded px-4 py-3 text-[0.9rem] text-nba-white font-body transition-all focus:outline-none focus:border-nba-blue focus:ring-4 focus:ring-nba-blue/20 placeholder-nba-gray"
        />
        <button type="submit" className="font-body font-bold text-[0.8rem] uppercase tracking-[0.8px] py-3.5 px-4 rounded border-none cursor-pointer text-nba-white transition-all bg-nba-red hover:shadow-[0_4px_14px_rgba(200,16,46,0.4)] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" disabled={loading}>
          {loading ? 'Verificando...' : 'Entrar al Panel VIP'}
        </button>
      </form>

      {error && <p className="text-nba-red font-semibold mt-4">❌ {error}</p>}
    </div>
  );
};

export default Login;