import axios from 'axios';

// ✅ CORREGIDO: Función para determinar baseURL de forma más robusta
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // En producción, usar variable de entorno o detectar automáticamente
    return process.env.REACT_APP_API_URL || `${window.location.origin}/api`;
  } else {
    // En desarrollo, usar localhost
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }
};

const api = axios.create({
<<<<<<< HEAD
  baseURL: getBaseURL(),
=======
  baseURL: '/api',
>>>>>>> origin/dev
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'web', // ✅ AGREGADO: Identificar cliente
    'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0'
  },
  withCredentials: true, // Importante para CORS con credenciales
  timeout: 10000, // ✅ AGREGADO: Timeout de 10 segundos
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
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    // Log para debug (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Log detallado del error
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
    }

    // Manejo específico de errores comunes
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token expirado o inválido
          console.warn('Token inválido o expirado, limpiando sesión...');
          localStorage.removeItem('token');
          
          // ✅ MEJORADO: Solo redirigir si no estamos ya en login/register
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
            // ✅ CORREGIDO: Usar window.location para evitar problemas de React Router
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Acceso denegado
          console.error('Acceso denegado:', data.msg || 'Sin permisos');
          break;
          
        case 404:
          console.error('Recurso no encontrado:', error.config?.url);
          break;
          
        case 422:
          // ✅ AGREGADO: Errores de validación
          console.error('Error de validación:', data.errors || data.msg);
          break;
          
        case 429:
          // ✅ AGREGADO: Rate limiting
          console.error('Demasiadas peticiones:', data.msg || 'Intenta más tarde');
          break;
          
        case 500:
          console.error('Error del servidor:', data.msg || 'Error interno');
          break;
          
        default:
          console.error('Error de API:', data.msg || error.message);
      }
    } else if (error.request) {
      // Error de red o servidor no disponible
      if (error.code === 'ECONNABORTED') {
        console.error('Timeout de conexión: La petición tardó demasiado');
      } else if (!navigator.onLine) {
        console.error('Sin conexión a internet');
      } else {
        console.error('Error de conexión:', 'No se pudo conectar con el servidor');
      }
    } else {
      console.error('Error de configuración:', error.message);
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
