// ============================================================
// api.js — Servicio centralizado de comunicación con el backend
// ============================================================
// POR QUÉ: La URL del backend estaba hardcodeada 12 veces en el código.
// Si mañana cambiás de localhost a producción, solo editás este archivo.
// PARA QUÉ: Ofrece funciones reutilizables (get, post, put, del) que
// manejan headers, token y JSON automáticamente.
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene el token JWT almacenado en localStorage.
 * @returns {string|null}
 */
const getToken = () => localStorage.getItem('token');

/**
 * Construye los headers comunes para cada petición.
 * Si hay token, lo incluye como Bearer.
 */
const buildHeaders = (includeAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Servicio API centralizado.
 * Todas las funciones retornan la respuesta cruda de fetch
 * para que el componente decida qué hacer con ella.
 */
const api = {
  /**
   * GET — Obtener datos públicos o protegidos.
   */
  get: async (endpoint, auth = false) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: auth ? buildHeaders(true) : {},
    });
    return res;
  },

  /**
   * POST — Crear recursos (equipos, jugadores, partidos, login).
   */
  post: async (endpoint, body, auth = false) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    });
    return res;
  },

  /**
   * PUT — Actualizar recursos existentes.
   */
  put: async (endpoint, body, auth = true) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    });
    return res;
  },

  /**
   * DELETE — Eliminar recursos.
   */
  del: async (endpoint, auth = true) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: buildHeaders(auth),
    });
    return res;
  },
};

export default api;
