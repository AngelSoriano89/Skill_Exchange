import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';

export const AuthContext = createContext({ user: null });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // ✅ AGREGADO: Estado para rastrear errores de conexión
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    if (token) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, [token]);

  // ✅ MEJORADO: Función para verificar estado de autenticación
  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      
      const res = await api.get('/auth/me');
      setUser(res.data);
      
      // ✅ AGREGADO: Actualizar último login
      if (res.data) {
        await api.put('/users/me', { 
          lastLogin: new Date().toISOString() 
        }).catch(() => {}); // No fallar si no se puede actualizar
      }
      
    } catch (error) {
      console.error('Error checking auth status:', error);
      
      // ✅ MEJORADO: Manejo específico de tipos de errores
      if (error.isNetworkError) {
        setConnectionError(true);
        // No limpiar token en errores de red, mantener sesión
        return;
      }
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token inválido o expirado
        console.log('Token inválido, limpiando sesión');
        clearAuthData();
      } else if (error.response?.status >= 500) {
        // Error del servidor
        setConnectionError(true);
      } else {
        // Otros errores
        clearAuthData();
      }
      
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ AGREGADO: Función helper para limpiar datos de autenticación
  const clearAuthData = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setConnectionError(false);
  }, []);

  // ✅ MEJORADO: Función de login con mejor manejo de errores
  const login = async (email, password) => {
    try {
      setLoading(true);
      setConnectionError(false);
      
      // ✅ AGREGADO: Validaciones básicas del lado cliente
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
      
      const res = await api.post('/auth/login', { 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      const { token: newToken } = res.data;
      
      if (!newToken) {
        throw new Error('Token no recibido del servidor');
      }
      
      // ✅ MEJORADO: Validar formato del token JWT
      if (!isValidJWT(newToken)) {
        throw new Error('Token inválido recibido del servidor');
      }
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Obtener datos del usuario después del login
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      
      // ✅ MEJORADO: Limpiar datos en caso de error
      clearAuthData();
      
      // ✅ MEJORADO: Manejo de errores más específico y user-friendly
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.isNetworkError) {
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

  // ✅ MEJORADO: Función de registro con validaciones mejoradas
  const register = async (userData) => {
    try {
      setLoading(true);
      setConnectionError(false);
      
      // ✅ AGREGADO: Validaciones del lado cliente
      const validation = validateRegistrationData(userData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }
      
      // ✅ AGREGADO: Preparar datos para envío
      const cleanedData = {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        bio: userData.bio?.trim() || '',
        phone: userData.phone?.trim() || '',
        skills_to_offer: userData.skills_to_offer || [],
        skills_to_learn: userData.skills_to_learn || []
      };
      
      const res = await api.post('/auth/register', cleanedData);
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
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      
      return { success: true };
      
    } catch (error) {
      console.error('Register error:', error);
      
      clearAuthData();
      
      // ✅ MEJORADO: Manejo de errores específicos para registro
      let errorMessage = 'Error al registrarse';
      
      if (error.isNetworkError) {
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

  // ✅ AGREGADO: Función para validar datos de registro
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

  // ✅ AGREGADO: Función para validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ✅ AGREGADO: Función para validar formato JWT
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

  // ✅ MEJORADO: Función para actualizar usuario
  const updateUser = useCallback((updatedUserData) => {
    if (updatedUserData && typeof updatedUserData === 'object') {
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUserData
      }));
    }
  }, []);

  // ✅ MEJORADO: Función de logout
  const logout = useCallback(() => {
    try {
      // ✅ AGREGADO: Notificar al servidor sobre el logout (opcional)
      if (token) {
        api.post('/auth/logout').catch(() => {}); // No fallar si no se puede notificar
      }
    } finally {
      clearAuthData();
    }
  }, [token, clearAuthData]);

  // ✅ AGREGADO: Función para verificar si el token está expirado
  const isTokenExpired = useCallback(() => {
    if (!token) return true;
    
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // ✅ AGREGADO: Margen de 5 minutos antes de la expiración
      return tokenData.exp < (currentTime + 300);
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }, [token]);

  // ✅ AGREGADO: Auto-logout cuando el token expira
  useEffect(() => {
    if (token && isTokenExpired()) {
      console.log('Token expirado, cerrando sesión automáticamente...');
      logout();
    }
  }, [token, isTokenExpired, logout]);

  // ✅ AGREGADO: Verificar token cada 5 minutos
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

  // ✅ AGREGADO: Función para refrescar token (para futuras implementaciones)
  const refreshToken = useCallback(async () => {
    try {
      const res = await api.post('/auth/refresh');
      const { token: newToken } = res.data;
      
      if (newToken && isValidJWT(newToken)) {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        return { success: true };
      } else {
        throw new Error('Token inválido recibido');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return { success: false };
    }
  }, [logout]);

  // ✅ AGREGADO: Función para retry de conexión
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
    refreshToken,
    retryConnection,
    
    // ✅ AGREGADO: Función para verificar permisos
    hasPermission: useCallback((permission) => {
      if (!user) return false;
      // Implementar lógica de permisos según sea necesario
      return true;
    }, [user]),
    
    // ✅ AGREGADO: Estado de la cuenta
    isEmailVerified: user?.isEmailVerified || false,
    isActive: user?.isActive || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
