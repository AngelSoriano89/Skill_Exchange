// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';
import { handleApiError, showSuccessToast } from '../utils/sweetAlert';

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
                const res = await api.get('/auth/me');
                setUser(res.data);
            } catch (err) {
                localStorage.removeItem('token');
                delete api.defaults.headers.common['x-auth-token'];
                setUser(null);
                console.error('Error al cargar el usuario:', err.message);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUser();
    }, []);

    // Función de registro
    const register = async (userData) => {
        try {
            const res = await api.post('/auth/register', userData);
            localStorage.setItem('token', res.data.token);
            await loadUser();
            showSuccessToast('¡Cuenta creada exitosamente!');
            return res.data;
        } catch (err) {
            handleApiError(err);
            throw err;
        }
    };

    // Función de login
    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            await loadUser();
            showSuccessToast('¡Bienvenido de vuelta!');
            return res.data;
        } catch (err) {
            handleApiError(err);
            throw err;
        }
    };

    // Función de logout
    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['x-auth-token'];
        setUser(null);
        showSuccessToast('Sesión cerrada correctamente');
    };

    // Función para actualizar el perfil del usuario
    const updateProfile = async (profileData) => {
        try {
            const res = await api.put('/profile', profileData);
            setUser(res.data);
            showSuccessToast('Perfil actualizado exitosamente');
            return res.data;
        } catch (err) {
            handleApiError(err);
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            register, 
            login, 
            logout, 
            updateProfile,
            loadUser 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
