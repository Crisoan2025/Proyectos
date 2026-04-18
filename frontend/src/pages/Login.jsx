import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Esta herramienta nos sirve para "redireccionar" al usuario a otra pantalla
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que la página parpadee al mandar el formulario
    setError(''); // Limpiamos errores previos

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();

      if (response.ok) {
        // ¡Gol! Guardamos el Pase VIP en el bolsillo secreto del navegador (localStorage)
        localStorage.setItem('token', data.token);
        
        // Lo mandamos automáticamente directo al panel de control
        navigate('/admin');
      } else {
        // Si el árbitro cobra falta (clave incorrecta)
        setError(data.message || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Falla de conexión con el servidor. ¿Está prendido Node?');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h2>🔑 Acceso Restringido</h2>
      <p>Ingresá tus credenciales de Administrador</p>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input 
          type="email" 
          placeholder="Tu correo (ej: admin@tpo.com)" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input 
          type="password" 
          placeholder="Tu contraseña secreta" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px', background: '#e65100', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
          Entrar al Panel VIP
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '15px', fontWeight: 'bold' }}>❌ {error}</p>}
    </div>
  );
};

export default Login;