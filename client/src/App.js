import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';
import LandingPage from './pages/Auth/LandingPage';
import RegisterPage from './pages/Auth/RegisterPage';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/App/Dashboard'; 
import UserProfilePage from './pages/App/ProfilePage'; 
import SearchPage from './pages/App/SearchPage'; 
import NotFound from './pages/Exchange/NotFound'; 
import EditProfilePage from './pages/profile/EditProfile';
import AddSkillPage from './pages/profile/AddSkill'; 
import UserContactPage from "./pages/Exchange/UserContacPage"

// Componente para proteger las rutas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return <div>Cargando...</div>;
  }
  return user ? children : <Navigate to="/login" />;
};

// Componente principal de la aplicación
const App = () => {
  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas Privadas */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            {/* Se corrige la ruta para que acepte un parámetro de ID de usuario */}
            <Route
              path="/profile/:id" 
              element={
                <PrivateRoute>
                  <UserProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/search"
              element={
                <PrivateRoute>
                  <SearchPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <PrivateRoute>
                  <EditProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/skills/add"
              element={
                <PrivateRoute>
                  <AddSkillPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/contact/:exchangeId"
              element={
                <PrivateRoute>
                  <UserContactPage />
                </PrivateRoute>
              }
            />
            
            {/* Ruta para páginas no encontradas */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
