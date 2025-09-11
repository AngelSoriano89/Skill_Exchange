import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm py-3">
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container-fluid">
          <Link to={user ? "/dashboard" : "/"} className="navbar-brand fs-4 fw-bold text-dark">
            Skill Exchange
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              {user ? (
                <>
                  <li className="nav-item">
                    <Link to="/dashboard" className="nav-link text-secondary">
                      <i className="fas fa-tachometer-alt me-1"></i>
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/search" className="nav-link text-secondary">
                      <i className="fas fa-search me-1"></i>
                      Buscar
                    </Link>
                  </li>
                  <li className="nav-item">
                    {/* CORRECCIÓN: Enlace al perfil propio sin ID en la URL */}
                    <Link to="/profile" className="nav-link text-secondary">
                      <i className="fas fa-user me-1"></i>
                      Mi Perfil
                    </Link>
                  </li>
                  <li className="nav-item ms-lg-3">
                    <div className="d-flex align-items-center">
                      {/* Avatar pequeño en el header */}
                      {user.avatar ? (
                        <img
                          src={`http://localhost:5000${user.avatar}`}
                          alt="Avatar"
                          className="rounded-circle me-2"
                          style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'inline-flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center me-2"
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          fontSize: '14px', 
                          fontWeight: 'bold',
                          display: user.avatar ? 'none' : 'inline-flex'
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-muted me-2 d-none d-md-inline">
                        Hola, {user.name.split(' ')[0]}
                      </span>
                      <button onClick={handleLogout} className="btn btn-primary rounded-pill px-4">
                        <i className="fas fa-sign-out-alt me-1"></i>
                        Cerrar Sesión
                      </button>
                    </div>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/register" className="nav-link text-secondary">
                      <i className="fas fa-user-plus me-1"></i>
                      Registrarse
                    </Link>
                  </li>
                  <li className="nav-item ms-lg-3">
                    <Link to="/login" className="btn btn-primary rounded-pill px-4">
                      <i className="fas fa-sign-in-alt me-1"></i>
                      Iniciar Sesión
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
