import React from 'react';
import './App.css';
import Header from './components/Common/Header';
import LandingPage from './pages/Auth/LandingPage';
import Footer from "./components/Common/Footer";
import { AuthProvider } from './context/AuthContext';
import { Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/Auth/RegisterPage';
import LoginPage from './pages/Auth/LoginPage';
import Dashboard from './pages/App/Dashboard';
import ProfilePage from './pages/App/ProfilePage';
import SearchPage from './pages/App/SearchPage';
import UserContactPage from './pages/Exchange/UserContactPage';
import ProtectedRoute from './components/Common/ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            {/* Ruta para perfil propio (sin ID) */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            {/* Ruta para perfil de otros usuarios (con ID) */}
            <Route 
              path="/profile/:id" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/search" 
              element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/exchange/:exchangeId/contact" 
              element={
                <ProtectedRoute>
                  <UserContactPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
