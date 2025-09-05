import React from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="bg-white p-5 rounded-4 shadow-lg" style={{ maxWidth: '480px', width: '100%' }}>
        <h2 className="text-center fw-bold text-dark mb-4">Iniciar Sesión</h2>
        <form>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold text-secondary">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="tu@correo.com"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold text-secondary">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary fw-semibold rounded-pill w-100 py-2 shadow-sm"
          >
            Iniciar Sesión
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-muted">
            ¿No tienes una cuenta? <Link to="/register" className="text-decoration-none">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
