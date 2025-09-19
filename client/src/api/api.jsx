import axios from 'axios';

// ✅ CORREGIDO: Configuración mejorada de baseURL
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
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para CORS con credenciales
  timeout: 10000, // ✅ AGREGADO: Timeout de 10 segundos
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    
    // Log para debug (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
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

// ✅ AGREGADO: Función helper para verificar conectividad
export const checkAPIHealth = async () => {
  try {
    const response = await api.get('/test');
    return { 
      status: 'ok', 
      message: response.data.message,
      timestamp: response.data.timestamp 
    };
  } catch (error) {
    return { 
      status: 'error', 
      message: 'API no disponible',
      error: error.message 
    };
  }
};

// ✅ AGREGADO: Función helper para reintentar peticiones fallidas
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Solo reintentar en errores de red o 5xx
      if (error.response?.status >= 500 || !error.response) {
        console.log(`Intento ${attempt} fallido, reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Backoff exponencial
      } else {
        throw error; // No reintentar errores 4xx
      }
    }
  }
};

export default api;
