import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleRegisterClick = (e) => {
    e.preventDefault(); // Previene la navegación por defecto del <a>
    navigate('/register');
  };

  const handleLoginClick = (e) => {
    e.preventDefault(); // Previene la navegación por defecto del <a>
    navigate('/login');
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column justify-content-center align-items-center p-3">
      <div className="container text-center bg-white p-4 rounded-4 shadow-lg hover-scale" style={{ maxWidth: '900px' }}>
        <h1 className="display-4 fw-bold gradient-text mb-3" style={{ lineHeight: '1.2' }}>
          Intercambia Conocimiento. Aprendan Juntos.
        </h1>
        <p className="text-secondary mb-3 mx-auto" style={{ maxWidth: '600px' }}>
          Conéctate con personas que tienen las habilidades que quieres aprender y enseña lo que sabes.
          <br />¡Es un ganar-ganar!
        </p>

        <div className="d-grid d-sm-flex justify-content-center gap-2">
          <a
            href="/register"
            className="btn btn-primary btn-md rounded-pill text-white gradient-button shadow-lg hover-lift"
            onClick={handleRegisterClick}
          >
            Regístrate Ahora
          </a>
          
          <a
            href="/login"
            className="btn btn-outline-secondary btn-md rounded-pill text-dark hover-lift"
            onClick={handleLoginClick}
          >
            Inicia Sesión
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
