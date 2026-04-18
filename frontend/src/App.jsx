import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import './App.css';

// 🛡️ Creamos la Barra de Navegación como un componente separado.
// Al usar "useLocation", la barra se actualiza sola cada vez que cambiamos de página.
const NavigationBar = () => {
  const location = useLocation();
  
  // El guardia chequea: ¿Hay un token guardado? (Devuelve true o false)
  const tienePaseVIP = !!localStorage.getItem('token');

  return (
    <nav style={{ padding: '15px', background: '#e65100', marginBottom: '20px', textAlign: 'center' }}>
      <Link to="/" style={{ marginRight: '20px', color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
        🏠 Inicio (Público)
      </Link>
      
      {/* MAGIA CONDICIONAL: Si NO tiene pase, mostramos el Login. Si SÍ tiene, mostramos el Panel */}
      {!tienePaseVIP ? (
        <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
          🔑 Acceso Admin
        </Link>
      ) : (
        <Link to="/admin" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
          ⚙️ Panel VIP
        </Link>
      )}
    </nav>
  );
};

function App() {
  return (
    <Router>
      {/* Ponemos nuestra barra inteligente acá arriba */}
      <NavigationBar />

      {/* Contenido de la Página */}
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Liga de Baloncesto TPO</h1>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


