import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';

export const AuthContext = createContext({ user: null });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Verificar token al cargar la app
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, [token]);

  const checkAuthStatus = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (error) {
      console.error('Error checking auth status:', error);
      // ✅ CORREGIDO: Limpiar estados cuando token es inválido
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true); // ✅ AGREGADO: Loading state durante login
      
      const res = await api.post('/auth/login', { email, password });
      const { token } = res.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      
      // Obtener datos del usuario después del login
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      // ✅ CORREGIDO: Limpiar estados en caso de error
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      
      // ✅ MEJORADO: Manejo de errores más específico
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response?.status === 401) {
        errorMessage = 'Credenciales incorrectas';
      } else if (error.response?.status === 400) {
        errorMessage = 'Datos de login inválidos';
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (!navigator.onLine) {
        errorMessage = 'Sin conexión a internet';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false); // ✅ CORREGIDO: Siempre quitar loading
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true); // ✅ AGREGADO: Loading state durante registro
      
      const res = await api.post('/auth/register', userData);
      const { token } = res.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      
      // Obtener datos del usuario después del registro
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      
      // ✅ CORREGIDO: Limpiar estados en caso de error
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      
      // ✅ MEJORADO: Manejo de errores más específico
      let errorMessage = 'Error al registrarse';
      
      if (error.response?.status === 400) {
        if (error.response.data.msg?.includes('ya existe')) {
          errorMessage = 'Este email ya está registrado';
        } else {
          errorMessage = error.response.data.msg || 'Datos de registro inválidos';
        }
      } else if (!navigator.onLine) {
        errorMessage = 'Sin conexión a internet';
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false); // ✅ CORREGIDO: Siempre quitar loading
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // ✅ AGREGADO: Función para verificar si el token está expirado
  const isTokenExpired = () => {
    if (!token) return true;
    
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return tokenData.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  };

  // ✅ AGREGADO: Auto-logout cuando el token expira
  useEffect(() => {
    if (token && isTokenExpired()) {
      console.log('Token expired, logging out...');
      logout();
    }
  }, [token]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    token, // ✅ AGREGADO: Exponer token para otros usos si es necesario
    isTokenExpired // ✅ AGREGADO: Función útil para otros componentes
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
