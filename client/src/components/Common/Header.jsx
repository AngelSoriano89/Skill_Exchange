import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

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
          <Link to="/dashboard" className="navbar-brand fs-4 fw-bold text-dark">
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
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/search" className="nav-link text-secondary">
                      Buscar
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={`/profile/${user.uid}`} className="nav-link text-secondary">
                      Perfil
                    </Link>
                  </li>
                  <li className="nav-item ms-lg-3">
                    <button onClick={handleLogout} className="btn btn-primary rounded-pill px-4">
                      Cerrar Sesión
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/register" className="nav-link text-secondary">
                      Registrarse
                    </Link>
                  </li>
                  <li className="nav-item ms-lg-3">
                    <Link to="/login" className="btn btn-primary rounded-pill px-4">
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
