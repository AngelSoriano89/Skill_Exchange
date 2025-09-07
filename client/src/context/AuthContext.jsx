// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api'; // Asegúrate de que esta ruta sea correcta

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Función para cargar los datos del usuario desde el token
    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            api.defaults.headers.common['x-auth-token'] = token;
            try {
                const res = await api.get('/auth/me'); // Endpoint para obtener el perfil del usuario
                setUser(res.data);
            } catch (err) {
                localStorage.removeItem('token');
                setUser(null);
                console.error('Error al cargar el usuario:', err.message);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUser();
    }, []);

    // Función de login

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            await loadUser();
        } catch (err) {
            // Manejo de errores más seguro
            console.error('Error de login:', err.response?.data?.msg || err.message);
            throw err;
        }
    };

    // Función de logout
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
