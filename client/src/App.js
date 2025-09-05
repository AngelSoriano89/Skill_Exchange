import React from 'react';
import './App.css'; // Importa el archivo CSS personalizado
import Header from './components/Common/Header';
import LandingPage from './pages/Auth/LandingPage';
import Footer from "./components/Common/Footer";
import { AuthProvider } from './context/AuthContext';
import { Routes, Route, Link } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import RegisterPage from './pages/Auth/RegisterPage';
import LoginPage from './pages/Auth/LoginPage';

// Componente principal de la aplicación que renderiza ambos componentes
const App = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <LandingPage /> {/* LandingPage is now static */}
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;

