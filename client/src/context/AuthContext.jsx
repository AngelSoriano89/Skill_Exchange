import React, { createContext, useState } from 'react';

// Crea un contexto con un valor por defecto que incluya la propiedad 'user'.
export const AuthContext = createContext({ user: null });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Funciones de login, logout, etc.
  const value = {
    user,
    // ...otras funciones
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
