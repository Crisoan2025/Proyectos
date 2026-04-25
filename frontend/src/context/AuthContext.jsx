// ============================================================
// AuthContext.jsx — Contexto global de autenticación
// ============================================================
// POR QUÉ: El token se leía de localStorage en 6 lugares diferentes.
// Si cambiabas la lógica de auth, tenías que editar 6 archivos.
// PARA QUÉ: Centraliza login, logout y la verificación de si el
// usuario está autenticado en un solo lugar. Cualquier componente
// puede consumir { token, login, logout, isAuthenticated } sin
// tocar localStorage directamente.
// ============================================================

import { createContext, useContext, useState, useMemo } from 'react';

const AuthContext = createContext(null);

/**
 * Proveedor de autenticación.
 * Envuelve la app en App.jsx para que todos los hijos tengan acceso.
 */
export const AuthProvider = ({ children }) => {
  // Inicializamos el estado leyendo localStorage una sola vez (lazy init)
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  /**
   * Guarda el token en localStorage y en el estado de React.
   */
  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  /**
   * Elimina el token de localStorage y del estado.
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const isAuthenticated = !!token;

  // useMemo evita re-renders innecesarios en los consumidores
  const value = useMemo(
    () => ({ token, login, logout, isAuthenticated }),
    [token, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para consumir el contexto de autenticación.
 * Uso: const { token, login, logout, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
};
