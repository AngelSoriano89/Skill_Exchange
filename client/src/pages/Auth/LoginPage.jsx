import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener la ruta de donde venía el usuario, o dashboard por defecto
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="bg-white p-5 rounded-4 shadow-lg" style={{ maxWidth: '480px', width: '100%' }}>
        <h2 className="text-center fw-bold text-dark mb-4">Iniciar Sesión</h2>
        
        {/* Mensaje de éxito si viene del registro */}
        {location.state?.message && (
          <div className="alert alert-success" role="alert">
            {location.state.message}
          </div>
        )}
        
        {/* Mensaje de error */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold text-secondary">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              placeholder="tu@correo.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold text-secondary">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary fw-semibold rounded-pill w-100 py-2 shadow-sm"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
        
        <div className="text-center mt-3">
          <p className="text-muted">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-decoration-none fw-semibold">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
