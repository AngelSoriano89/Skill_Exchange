import axios from 'axios';

// ✅ CORREGIDO: Función para determinar baseURL de forma más robusta
const getBaseURL = () => {
  // ✅ Priorizar variable de entorno específica
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // ✅ En desarrollo, usar localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000/api';
  }
  
  // ✅ En producción, intentar detectar automáticamente
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    
    // ✅ Si estamos en el mismo dominio, usar ruta relativa
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    
    // ✅ Para dominios de producción, usar ruta relativa
    return '/api';
  }
  
  // ✅ Fallback para SSR o casos edge
  return '/api';
};

// ✅ CORREGIDO: Configuración mejorada de axios
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // ✅ AGREGADO: Timeout de 30 segundos
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'web', // ✅ AGREGADO: Identificar cliente
    'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0'
  },
  // ✅ AGREGADO: Habilitar cookies/credenciales
  withCredentials: false // Cambiar a true si usas cookies para auth
});

// ✅ MEJORADO: Interceptor para requests con mejor logging y error handling
api.interceptors.request.use(
  (config) => {
    // ✅ Agregar token si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    
    // ✅ Log para debug (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    }
    
    // ✅ AGREGADO: Timestamp para métricas
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ AGREGADO: Interceptor para responses con manejo de errores mejorado
api.interceptors.response.use(
  (response) => {
    // ✅ Log de respuesta exitosa (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`✅ API Response: ${response.status} (${duration}ms)`, {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // ✅ Log de error detallado
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        status: error.response?.status,
        message: error.message,
        url: originalRequest?.url,
        method: originalRequest?.method,
        data: error.response?.data
      });
    }
    
    // ✅ AGREGADO: Manejo específico de errores 401 (token expirado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // ✅ Token inválido, limpiar almacenamiento local
      localStorage.removeItem('token');
      
      // ✅ Redirigir al login si no estamos ya ahí
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        console.log('🔄 Token expirado, redirigiendo al login...');
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
    
    // ✅ AGREGADO: Manejo de errores de red
    if (!error.response) {
      // Error de conexión/red
      const networkError = new Error('Error de conexión. Verifica tu conexión a internet.');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }
    
    // ✅ AGREGADO: Manejo de errores del servidor
    if (error.response.status >= 500) {
      const serverError = new Error('Error del servidor. Intenta de nuevo más tarde.');
      serverError.isServerError = true;
      serverError.originalError = error;
      return Promise.reject(serverError);
    }
    
    return Promise.reject(error);
  }
);

// ✅ CORREGIDO: Función helper para verificar conectividad mejorada
export const checkAPIHealth = async () => {
  try {
    const response = await api.get('/health', {
      timeout: 5000 // ✅ Timeout específico para health check
    });
    
    return { 
      status: 'ok', 
      message: response.data.message,
      timestamp: response.data.timestamp,
      environment: response.data.environment || 'unknown',
      version: response.data.version || 'unknown'
    };
  } catch (error) {
    console.error('Health check failed:', error);
    
    return { 
      status: 'error', 
      message: error.isNetworkError 
        ? 'Sin conexión al servidor'
        : error.isServerError 
          ? 'Servidor no disponible'
          : error.response?.data?.msg || 'API no disponible',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// ✅ MEJORADO: Función helper para reintentar peticiones con backoff exponencial
export const retryRequest = async (requestFn, options = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffFactor = 2,
    retryCondition = (error) => {
      // ✅ Solo reintentar en errores de red o 5xx
      return !error.response || error.response.status >= 500;
    }
  } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      // ✅ No reintentar en el último intento
      if (attempt === maxRetries) {
        throw error;
      }
      
      // ✅ Verificar si debemos reintentar
      if (!retryCondition(error)) {
        throw error;
      }
      
      // ✅ Calcular delay con backoff exponencial
      const delay = initialDelay * Math.pow(backoffFactor, attempt - 1);
      
      console.log(`🔄 Intento ${attempt} fallido, reintentando en ${delay}ms...`, {
        error: error.message,
        status: error.response?.status
      });
      
      // ✅ Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// ✅ AGREGADO: Helper para requests con cache básico
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const getCachedRequest = async (url, options = {}) => {
  const cacheKey = `${url}${JSON.stringify(options)}`;
  const cached = cache.get(cacheKey);
  
  // ✅ Verificar si tenemos cache válido
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`📦 Using cached response for ${url}`);
    return cached.data;
  }
  
  try {
    // ✅ Hacer request y cachear respuesta
    const response = await api.get(url, options);
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    
    return response.data;
  } catch (error) {
    // ✅ Si hay error pero tenemos cache, usar cache aunque esté expirado
    if (cached) {
      console.log(`⚠️ Using stale cache for ${url} due to error`);
      return cached.data;
    }
    throw error;
  }
};

// ✅ AGREGADO: Limpiar cache cuando sea necesario
export const clearCache = () => {
  cache.clear();
  console.log('🗑️ API cache cleared');
};

// ✅ AGREGADO: Helper para manejar uploads con progreso
export const uploadWithProgress = (url, formData, onProgress) => {
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// ✅ AGREGADO: Helper para debug en desarrollo
export const debugAPI = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 API Debug Info:', {
      baseURL: api.defaults.baseURL,
      timeout: api.defaults.timeout,
      token: localStorage.getItem('token') ? 'Present' : 'Not set',
      cacheSize: cache.size
    });
  }
};

export default api;
