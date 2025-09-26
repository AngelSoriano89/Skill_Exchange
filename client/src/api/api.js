// Configuración centralizada de la API
const getApiPrefix = () => {
  const envPrefix = process.env.REACT_APP_API_PREFIX || process.env.REACT_APP_API_BASE_PATH;
  if (!envPrefix) return '/api';
  // Asegurar que comience con '/'
  return envPrefix.startsWith('/') ? envPrefix : `/${envPrefix}`;
};

const getApiBaseUrl = () => {
  // Prioridad: Variable de entorno > Auto-detección > Default
  if (process.env.REACT_APP_API_URL) {
    const envUrl = process.env.REACT_APP_API_URL.trim();
    // Si es relativa, resolver contra el origin de la ventana
    const finalUrl = envUrl.startsWith('http') ? envUrl : `${window.location.origin}${envUrl}`;
    return finalUrl.replace(/\/$/, ''); // Remover trailing slash
  }
  
  if (process.env.NODE_ENV === 'production') {
    // En producción, asumir que API está en el mismo dominio con prefijo configurable
    return `${window.location.origin}${getApiPrefix()}`;
  }
  
  // Desarrollo
  return `http://localhost:5000${getApiPrefix()}`;
};

const getFileBaseUrl = () => {
  if (process.env.REACT_APP_FILES_URL) {
    const envUrl = process.env.REACT_APP_FILES_URL.trim();
    const finalUrl = envUrl.startsWith('http') ? envUrl : `${window.location.origin}${envUrl}`;
    return finalUrl.replace(/\/$/, '');
  }
  
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }
  
  return 'http://localhost:5000';
};

export const API_CONFIG = {
  baseURL: getApiBaseUrl(),
  filesURL: getFileBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'web',
    'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0'
  }
};

// Helper para construir URLs de archivos
export const buildFileUrl = (filePath, cacheKey) => {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath;
  
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  const base = `${API_CONFIG.filesURL}${cleanPath}`;
  if (cacheKey) {
    const v = typeof cacheKey === 'string' ? cacheKey : String(cacheKey);
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}v=${encodeURIComponent(v)}`;
  }
  return base;
};

// Helper para construir URLs de avatar
export const buildAvatarUrl = (avatarPath, cacheKey) => {
  if (!avatarPath) return null;
  return buildFileUrl(avatarPath, cacheKey);
};

// Configuración de endpoints
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    logout: '/auth/logout',
    refresh: '/auth/refresh'
  },
  users: {
    list: '/users',
    me: '/users/me',
    byId: (id) => `/users/${id}`,
    stats: '/users/stats'
  },
  exchanges: {
    request: '/exchanges/request',
    myRequests: '/exchanges/my-requests',
    pending: '/exchanges/pending',
    stats: '/exchanges/stats',
    accept: (id) => `/exchanges/accept/${id}`,
    reject: (id) => `/exchanges/reject/${id}`,
    complete: (id) => `/exchanges/complete/${id}`,
    cancel: (id) => `/exchanges/cancel/${id}`,
    byId: (id) => `/exchanges/${id}`
  },
  skills: {
    list: '/skills',
    create: '/skills',
    mySkills: '/skills/my-skills',
    categories: '/skills/categories',
    byUser: (userId) => `/skills/user/${userId}`,
    byId: (id) => `/skills/${id}`
  },
  ratings: {
    create: '/ratings',
    myRatings: '/ratings/my-ratings',
    byUser: (userId) => `/ratings/user/${userId}`,
    stats: (userId) => `/ratings/stats/${userId}`,
    byId: (id) => `/ratings/${id}`
  }
};

export default API_CONFIG;
