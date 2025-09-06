import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Asegúrate de que la ruta sea correcta
import { FaUserCircle } from 'react-icons/fa'; // Icono opcional para el formulario

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Resetear cualquier error previo

    try {
      await login(email, password);
      navigate('/dashboard'); // Redirige al dashboard al iniciar sesión con éxito
    } catch (err) {
      console.error('Error de inicio de sesión:', err);
      // Muestra un mensaje de error si las credenciales son inválidas
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.');
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="bg-white p-5 rounded-4 shadow-lg" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="text-center mb-4">
          <FaUserCircle size={60} className="text-primary mb-3" />
          <h2 className="fw-bold text-dark">Iniciar Sesión</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Campo de Correo Electrónico */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold text-secondary">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {/* Campo de Contraseña */}
          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold text-secondary">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Muestra el mensaje de error si existe */}
          {error && <div className="alert alert-danger text-center small">{error}</div>}
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
