import axios from 'axios';

// Configuración inicial de la API
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    const envUrl = process.env.REACT_APP_API_URL.trim();
    return envUrl.startsWith('http') ? envUrl : `${window.location.origin}${envUrl}`;
  }
  
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin + (process.env.REACT_APP_API_PREFIX || '/api');
  }
  
  // En desarrollo, asumir que el servidor corre en localhost:5000
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
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
    if (process.env.NODE_ENV === 'development') {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
    }

    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.warn('🔒 Token inválido, limpiando sesión...');
          localStorage.removeItem('token');
          
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          console.error('🚫 Acceso denegado');
          break;
          
        case 404:
          console.error('🔍 Recurso no encontrado');
          break;
          
        case 429:
          console.error('⏰ Rate limit excedido');
          break;
          
        case 500:
          console.error('🔥 Error del servidor');
          break;
      }
    } else if (error.request) {
      if (error.code === 'ECONNABORTED') {
        console.error('⏱️ Timeout de conexión');
      } else if (!navigator.onLine) {
        console.error('📡 Sin conexión a internet');
      } else {
        console.error('🌐 Error de conexión');
      }
    }

    return Promise.reject(error);
  }
);

// Health check mejorado
export const checkAPIHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return { 
      status: 'ok', 
      data: response.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { 
      status: 'error', 
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Upload con progreso
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

export default api;
