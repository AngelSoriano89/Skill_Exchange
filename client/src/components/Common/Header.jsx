import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    // Si la ruta ya incluye http, devolverla tal como está
    if (avatarPath.startsWith('http')) return avatarPath;
    // Si no, agregar la URL base del servidor
    return `http://localhost:5000${avatarPath}`;
  };

  const renderAvatar = (size = 'w-8 h-8') => {
    const avatarUrl = user?.avatar ? getAvatarUrl(user.avatar) : null;
    
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={`Avatar de ${user?.name || 'Usuario'}`}
          className={`${size} rounded-full object-cover border-2 border-white shadow-md`}
          onError={(e) => {
            // Si la imagen falla, ocultar y mostrar el avatar con inicial
            e.target.style.display = 'none';
            const fallback = e.target.nextElementSibling;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      );
    }
    
    return (
      <div className={`${size} bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold shadow-md`}>
        {user?.name?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to={user ? "/dashboard" : "/"} 
            className="text-2xl font-bold gradient-text hover:opacity-80 transition-opacity"
          >
            <i className="fas fa-exchange-alt mr-2"></i>
            Skill Exchange
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  <i className="fas fa-tachometer-alt mr-2"></i>
                  Dashboard
                </Link>
                <Link 
                  to="/search" 
                  className="flex items-center text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  <i className="fas fa-search mr-2"></i>
                  Buscar
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center text-gray-600 hover:text-primary-600 font-medium transition-colors"
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
                  
                  {renderAvatar()}
                  
                  <button 
                    onClick={handleLogout}
                    className="btn-primary text-sm px-4 py-2"
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
                  className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  <i className="fas fa-user-plus mr-1"></i>
                  Registrarse
                </Link>
                <Link 
                  to="/login" 
                  className="btn-primary"
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
              className="text-gray-600 hover:text-primary-600 focus:outline-none focus:text-primary-600"
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
                  {renderAvatar()}
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.skills_to_offer?.length || 0} habilidades
                    </p>
                  </div>
                </div>
                
                <Link 
                  to="/dashboard" 
                  className="flex items-center text-gray-600 hover:text-primary-600 font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-tachometer-alt mr-3 w-5"></i>
                  Dashboard
                </Link>
                <Link 
                  to="/search" 
                  className="flex items-center text-gray-600 hover:text-primary-600 font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-search mr-3 w-5"></i>
                  Buscar
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center text-gray-600 hover:text-primary-600 font-medium py-2 transition-colors"
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
                  className="flex items-center text-red-600 hover:text-red-700 font-medium py-2 transition-colors"
                >
                  <i className="fas fa-sign-out-alt mr-3 w-5"></i>
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                <Link 
                  to="/register" 
                  className="flex items-center text-gray-600 hover:text-primary-600 font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-user-plus mr-3 w-5"></i>
                  Registrarse
                </Link>
                <Link 
                  to="/login" 
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium py-2 transition-colors"
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
