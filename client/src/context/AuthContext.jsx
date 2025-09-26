import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api.jsx';
import { ENDPOINTS } from '../api/api.js';

export const AuthContext = createContext({ user: null });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [connectionError, setConnectionError] = useState(false);

  // Nota: definimos clearAuthData antes de checkAuthStatus para evitar advertencias del linter

  // Función helper para limpiar datos de autenticación
  const clearAuthData = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setConnectionError(false);
  }, []);

  // Función para verificar estado de autenticación
  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      
      const res = await api.get(ENDPOINTS.auth.me);
      setUser(res.data);
      // Nota: ya no actualizamos lastLogin desde el cliente.
      // El servidor actualiza lastLogin durante el login para evitar validaciones innecesarias.
      
    } catch (error) {
      console.error('Error checking auth status:', error);
      
      if (error.code === 'ERR_NETWORK' || !error.response) {
        setConnectionError(true);
        return; // No limpiar token en errores de red
      }
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Token inválido, limpiando sesión');
        clearAuthData();
      } else if (error.response?.status >= 500) {
        setConnectionError(true);
      } else {
        clearAuthData();
      }
      
    } finally {
      setLoading(false);
    }
  }, [clearAuthData]);

  // Inicializar estado de autenticación cuando cambie el token
  useEffect(() => {
    if (token) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, [token, checkAuthStatus]);

  // Función de login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setConnectionError(false);
      
      // Validaciones básicas del lado cliente
      if (!email || !email.trim()) {
        return {
          success: false,
          error: 'El email es requerido'
        };
      }
      
      if (!password || password.length < 6) {
        return {
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres'
        };
      }
      
      const res = await api.post(ENDPOINTS.auth.login, { 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      const { token: newToken } = res.data;
      
      if (!newToken) {
        throw new Error('Token no recibido del servidor');
      }
      
      // Validar formato del token JWT
      if (!isValidJWT(newToken)) {
        throw new Error('Token inválido recibido del servidor');
      }
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Obtener datos del usuario después del login
      const userRes = await api.get(ENDPOINTS.auth.me);
      setUser(userRes.data);
      
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      
      clearAuthData();
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.code === 'ERR_NETWORK' || !error.response) {
        errorMessage = 'Sin conexión a internet. Verifica tu conexión.';
        setConnectionError(true);
      } else if (error.response?.status === 401) {
        errorMessage = 'Email o contraseña incorrectos';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.msg || 'Datos de login inválidos';
      } else if (error.response?.status === 429) {
        errorMessage = 'Demasiados intentos. Espera un momento antes de intentar de nuevo.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error del servidor. Intenta de nuevo más tarde.';
        setConnectionError(true);
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error.message.includes('Token')) {
        errorMessage = 'Error de autenticación. Intenta de nuevo.';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
      
    } finally {
      setLoading(false);
    }
  };

  // Función de registro
  const register = async (userData) => {
    try {
      setLoading(true);
      setConnectionError(false);
      
      // Validaciones del lado cliente
      const validation = validateRegistrationData(userData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }
      
      // Preparar datos para envío
      const cleanedData = {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        bio: userData.bio?.trim() || '',
        phone: userData.phone?.trim() || '',
        skills_to_offer: userData.skills_to_offer || [],
        skills_to_learn: userData.skills_to_learn || []
      };
      
      const res = await api.post(ENDPOINTS.auth.register, cleanedData);
      const { token: newToken } = res.data;
      
      if (!newToken) {
        throw new Error('Token no recibido del servidor');
      }
      
      if (!isValidJWT(newToken)) {
        throw new Error('Token inválido recibido del servidor');
      }
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Obtener datos del usuario después del registro
      const userRes = await api.get(ENDPOINTS.auth.me);
      setUser(userRes.data);
      
      return { success: true };
      
    } catch (error) {
      console.error('Register error:', error);
      
      clearAuthData();
      
      let errorMessage = 'Error al registrarse';
      
      if (error.code === 'ERR_NETWORK' || !error.response) {
        errorMessage = 'Sin conexión a internet. Verifica tu conexión.';
        setConnectionError(true);
      } else if (error.response?.status === 400) {
        const serverMsg = error.response.data?.msg || '';
        if (serverMsg.includes('ya existe') || serverMsg.includes('already exists')) {
          errorMessage = 'Este email ya está registrado. ¿Ya tienes cuenta?';
        } else if (serverMsg.includes('validation') || serverMsg.includes('validación')) {
          errorMessage = error.response.data.msg || 'Datos de registro inválidos';
        } else {
          errorMessage = serverMsg || 'Datos de registro inválidos';
        }
      } else if (error.response?.status === 429) {
        errorMessage = 'Demasiados registros. Espera un momento antes de intentar de nuevo.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error del servidor. Intenta de nuevo más tarde.';
        setConnectionError(true);
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
      
    } finally {
      setLoading(false);
    }
  };

  // Función para validar datos de registro
  const validateRegistrationData = (data) => {
    if (!data.name || data.name.trim().length < 2) {
      return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
    }
    
    if (!data.email || !isValidEmail(data.email)) {
      return { isValid: false, error: 'Email inválido' };
    }
    
    if (!data.password || data.password.length < 6) {
      return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }
    
    if (data.bio && data.bio.length > 500) {
      return { isValid: false, error: 'La biografía no puede exceder 500 caracteres' };
    }
    
    return { isValid: true };
  };

  // Función para validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para validar formato JWT
  const isValidJWT = (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Verificar que las partes sean base64 válidas
      const payload = JSON.parse(atob(parts[1]));
      return payload && payload.exp && payload.user;
    } catch (error) {
      return false;
    }
  };

  // Función para actualizar usuario
  const updateUser = useCallback((updatedUserData) => {
    if (updatedUserData && typeof updatedUserData === 'object') {
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUserData
      }));
    }
  }, []);

  // Función de logout
  const logout = useCallback(() => {
    try {
      // Notificar al servidor sobre el logout (opcional)
      if (token) {
        api.post(ENDPOINTS.auth.logout).catch(() => {}); // No fallar si no se puede notificar
      }
    } finally {
      clearAuthData();
    }
  }, [token, clearAuthData]);

  // Función para verificar si el token está expirado
  const isTokenExpired = useCallback(() => {
    if (!token) return true;
    
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Margen de 5 minutos antes de la expiración
      return tokenData.exp < (currentTime + 300);
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }, [token]);

  // Auto-logout cuando el token expira
  useEffect(() => {
    if (token && isTokenExpired()) {
      console.log('Token expirado, cerrando sesión automáticamente...');
      logout();
    }
  }, [token, isTokenExpired, logout]);

  // Verificar token cada 5 minutos
  useEffect(() => {
    if (!token || !user) return;

    const interval = setInterval(() => {
      if (isTokenExpired()) {
        console.log('Token expirado detectado en verificación periódica');
        logout();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [token, user, isTokenExpired, logout]);

  // Función para retry de conexión
  const retryConnection = useCallback(() => {
    if (token) {
      setConnectionError(false);
      checkAuthStatus();
    }
  }, [token, checkAuthStatus]);

  const value = {
    // Estados
    user,
    loading,
    connectionError,
    
    // Funciones principales
    login,
    register,
    logout,
    updateUser,
    
    // Funciones de utilidad
    isAuthenticated: !!user,
    token,
    isTokenExpired,
    retryConnection,
    
    // Función para verificar permisos
    hasPermission: useCallback((permission) => {
      if (!user) return false;
      // Implementar lógica de permisos según sea necesario
      return true;
    }, [user]),
    
    // Estado de la cuenta
    isEmailVerified: user?.isEmailVerified || false,
    isActive: user?.isActive || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
