
import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar el usuario y el token desde el almacenamiento local
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['x-auth-token'] = token;
        try {
          const res = await api.get('/auth/me'); // Endpoint para obtener el perfil del usuario
          setUser(res.data.user); // Asegúrate de que tu backend envíe el usuario
        } catch (err) {
          console.error(err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // src/context/AuthContext.js

// ... (código anterior)

const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    
    // Paso 1: Guardar el token en localStorage
    localStorage.setItem('token', res.data.token);
    
    // Paso 2: Configurar el token en la cabecera de las peticiones futuras
    api.defaults.headers.common['x-auth-token'] = res.data.token;
    
    // Paso 3 (La solución): Obtener los datos del usuario y actualizar el estado
    const userRes = await api.get('/auth/me'); // Llama a la ruta protegida
    setUser(userRes.data.user); // Actualiza el estado con los datos del perfil
    
  } catch (err) {
    console.error(err);
    // Manejo de errores
  }
};

// ... (resto del código)

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
