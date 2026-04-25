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
import api from '../services/api';

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
    <div className="login-container">
      <h2>🔑 Acceso Restringido</h2>
      <p>Ingresá tus credenciales de Administrador</p>
      
      <form onSubmit={handleLogin} className="login-form">
        <input 
          type="email" 
          placeholder="Tu correo (ej: admin@tpo.com)" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Tu contraseña secreta" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Verificando...' : 'Entrar al Panel VIP'}
        </button>
      </form>

      {error && <p className="error-text">❌ {error}</p>}
    </div>
  );
};

export default Login;