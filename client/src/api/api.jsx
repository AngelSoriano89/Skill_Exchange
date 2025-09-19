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

// Determinar la baseURL según el entorno
const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api'  // En producción, usar ruta relativa
  : 'http://localhost:5000/api';  // En desarrollo, usar URL completa

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
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
