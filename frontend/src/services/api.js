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
 * Maneja las respuestas de la API, interceptando errores 401.
 *
 * 🔧 CORRECCIÓN (Bug #2 — El login recargaba la página y ocultaba el error):
 * ANTES este interceptor se disparaba en CUALQUIER 401, incluido el del propio
 * `POST /auth/login`. Una contraseña incorrecta devuelve 401, así que forzaba
 * `window.location.href = '/login'` (recarga dura) y el mensaje "Credenciales
 * inválidas" no llegaba a verse.
 * AHORA aceptamos `options.redirectOn401`: el login lo pasa en `false` para que
 * un 401 de credenciales se maneje en pantalla, sin redirigir. El resto de las
 * peticiones (token vencido) mantienen el redirect por defecto. Además evitamos
 * un bucle: solo redirigimos si NO estamos ya en /login.
 */
const handleResponse = async (res, options = {}) => {
  const { redirectOn401 = true } = options;
  if (res.status === 401 && redirectOn401) {
    localStorage.removeItem('token');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  return res;
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
  get: async (endpoint, auth = false, options = {}) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: auth ? buildHeaders(true) : {},
    });
    return handleResponse(res, options);
  },

  /**
   * POST — Crear recursos (equipos, jugadores, partidos, login).
   */
  post: async (endpoint, body, auth = false, options = {}) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    });
    return handleResponse(res, options);
  },

  /**
   * PUT — Actualizar recursos existentes.
   */
  put: async (endpoint, body, auth = true, options = {}) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    });
    return handleResponse(res, options);
  },

  /**
   * DELETE — Eliminar recursos.
   */
  del: async (endpoint, auth = true, options = {}) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: buildHeaders(auth),
    });
    return handleResponse(res, options);
  },
};

export default api;
