import axios from 'axios';

// Determinar la baseURL según el entorno
const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api'  // En producción, usar ruta relativa
  : 'http://localhost:5000/api';  // En desarrollo, usar URL completa

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para CORS con credenciales
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
          localStorage.removeItem('token');
          if (window.location.pathname !== '/login') {
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
        case 500:
          console.error('Error del servidor:', data.msg || 'Error interno');
          break;
        default:
          console.error('Error de API:', data.msg || error.message);
      }
    } else if (error.request) {
      // Error de red o servidor no disponible
      console.error('Error de conexión:', 'No se pudo conectar con el servidor');
    } else {
      console.error('Error de configuración:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
