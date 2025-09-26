import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Avatar from './Avatar';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to={user ? "/dashboard" : "/"} 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            <i className="fas fa-exchange-alt mr-2 text-blue-600"></i>
            Skill Exchange
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  <i className="fas fa-tachometer-alt mr-2"></i>
                  Dashboard
                </Link>
                <Link 
                  to="/search" 
                  className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  <i className="fas fa-search mr-2"></i>
                  Buscar
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  <i className="fas fa-user mr-2"></i>
                  Mi Perfil
                </Link>
                
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium text-gray-900">
                      ¡Hola, {user.name.split(' ')[0]}!
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.skills_to_offer?.length || 0} habilidades
                    </p>
                  </div>
                  
                  <Avatar 
                    user={user} 
                    size="sm"
                    onClick={() => navigate('/profile')}
                  />
                  
                  <button 
                    onClick={handleLogout}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <i className="fas fa-sign-out-alt mr-1"></i>
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/register" 
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  <i className="fas fa-user-plus mr-1"></i>
                  Registrarse
                </Link>
                <Link 
                  to="/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  <i className="fas fa-sign-in-alt mr-1"></i>
                  Iniciar Sesión
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 animate-fade-in">
            {user ? (
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar 
                    user={user} 
                    size="md"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">
                      {user.skills_to_offer?.length || 0} habilidades
                    </p>
                  </div>
                </div>
                
                <Link 
                  to="/dashboard" 
                  className="flex items-center text-gray-600 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-tachometer-alt mr-3 w-5"></i>
                  Dashboard
                </Link>
                <Link 
                  to="/search" 
                  className="flex items-center text-gray-600 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-search mr-3 w-5"></i>
                  Buscar
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center text-gray-600 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-user mr-3 w-5"></i>
                  Mi Perfil
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center text-red-600 hover:text-red-700 font-medium py-2 transition-colors w-full text-left"
                >
                  <i className="fas fa-sign-out-alt mr-3 w-5"></i>
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                <Link 
                  to="/register" 
                  className="flex items-center text-gray-600 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-user-plus mr-3 w-5"></i>
                  Registrarse
                </Link>
                <Link 
                  to="/login" 
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-sign-in-alt mr-3 w-5"></i>
                  Iniciar Sesión
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
