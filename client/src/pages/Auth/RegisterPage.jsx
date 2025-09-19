import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../../api/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    skills_to_offer: '',
    skills_to_learn: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El email es obligatorio');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        skills_to_offer: formData.skills_to_offer 
          ? formData.skills_to_offer.split(',').map(s => s.trim()).filter(s => s)
          : [],
        skills_to_learn: formData.skills_to_learn 
          ? formData.skills_to_learn.split(',').map(s => s.trim()).filter(s => s)
          : []
      };

      await api.post('/auth/register', submitData);
      
      // Redirigir al login con mensaje de éxito
      navigate('/login', { 
        state: { message: '¡Registro exitoso! Ahora puedes iniciar sesión.' }
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.msg || 'Error al registrarse. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center bg-light">
      <div className="bg-white p-5 rounded-4 shadow-lg w-100" style={{ maxWidth: '500px' }}>
        <h2 className="fs-3 fw-bold text-center text-dark mb-4">Regístrate</h2>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label text-secondary fw-semibold">
              Nombre Completo
            </label>
            <input
              type="text"
              name="name"
              id="name"
              className={`form-control ${error && !formData.name ? 'is-invalid' : ''}`}
              placeholder="Tu nombre completo"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="email" className="form-label text-secondary fw-semibold">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className={`form-control ${error && !formData.email ? 'is-invalid' : ''}`}
              placeholder="tu@correo.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="password" className="form-label text-secondary fw-semibold">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className={`form-control ${error && formData.password.length < 6 ? 'is-invalid' : ''}`}
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <div className="form-text">Debe tener al menos 6 caracteres</div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="skills_to_offer" className="form-label text-secondary fw-semibold">
              Habilidades que ofreces
            </label>
            <input
              type="text"
              name="skills_to_offer"
              id="skills_to_offer"
              className="form-control"
              placeholder="Ej: JavaScript, Cocina, Inglés (separadas por comas)"
              value={formData.skills_to_offer}
              onChange={handleChange}
              disabled={loading}
            />
            <div className="form-text">Opcional - separa con comas</div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="skills_to_learn" className="form-label text-secondary fw-semibold">
              Habilidades que quieres aprender
            </label>
            <input
              type="text"
              name="skills_to_learn"
              id="skills_to_learn"
              className="form-control"
              placeholder="Ej: Piano, Fotografía, Python (separadas por comas)"
              value={formData.skills_to_learn}
              onChange={handleChange}
              disabled={loading}
            />
            <div className="form-text">Opcional - separa con comas</div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary fw-semibold rounded-pill shadow-sm w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registrando...
              </>
            ) : (
              'Regístrate'
            )}
          </button>
        </form>
        
        <div className="text-center mt-3">
          <p className="text-muted">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-decoration-none fw-semibold">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
