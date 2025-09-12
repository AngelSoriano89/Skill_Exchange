import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center bg-light">
      <h1 className="display-1 fw-bold text-danger">404</h1>
      <h2 className="mb-3">¡Página no encontrada!</h2>
      <p className="lead text-muted">
        Lo sentimos, la página que estás buscando no existe.
      </p>
      <Link 
        to="/" 
        className="btn btn-primary mt-3 rounded-pill"
      >
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;
