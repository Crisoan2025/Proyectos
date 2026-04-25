// ============================================================
// useApi.js — Custom Hook para carga de datos con estado
// ============================================================
// POR QUÉ: Las 3 funciones cargarEquipos/cargarPartidos/cargarJugadores
// repetían el mismo patrón: fetch → json → setState → catch.
// PARA QUÉ: Encapsula el patrón común de data fetching agregando
// estados de loading y error que antes no existían.
// Regla react-best-practices: rerender-lazy-state-init
// ============================================================

import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook reutilizable para cargar datos desde la API.
 *
 * @param {string} endpoint - Ruta de la API (ej: '/equipos')
 * @param {boolean} auth - Si requiere autenticación
 * @returns {{ data, loading, error, reload }}
 *
 * Ejemplo de uso:
 *   const { data: equipos, loading, error, reload } = useApi('/equipos');
 */
const useApi = (endpoint, auth = false) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // useCallback evita que la función se recree en cada render
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint, auth);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
      console.error(`Error cargando ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, auth]);

  return { data, loading, error, reload, setData };
};

export default useApi;
