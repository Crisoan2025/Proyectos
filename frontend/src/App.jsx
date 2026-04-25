// ============================================================
// App.jsx — Componente raíz de la aplicación
// ============================================================
// POR QUÉ: Antes contenía la NavigationBar embebida y no tenía
// un proveedor de autenticación centralizado.
// PARA QUÉ: Ahora solo ensambla el Router, el AuthProvider y
// las rutas. Cada responsabilidad vive en su propio archivo.
// ============================================================

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavigationBar from './components/NavigationBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavigationBar />

        <div className="page-container">
          <h1>Liga de Baloncesto TPO</h1>
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
