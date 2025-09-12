import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaUserPlus, FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';
import { showLoadingAlert, closeLoadingAlert } from '../../utils/sweetAlert';

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
  const { register } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    phone: '',
    skillsToOffer: '',
    skillsToLearn: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    showLoadingAlert('Creando cuenta...', 'Configurando tu perfil');

    const skills_to_offer_array = formData.skillsToOffer.split(',').map(skill => skill.trim()).filter(Boolean);
    const skills_to_learn_array = formData.skillsToLearn.split(',').map(skill => skill.trim()).filter(Boolean);

    try {
      await register({ 
        name: formData.name, 
        email: formData.email, 
        password: formData.password,
        bio: formData.bio,
        phone: formData.phone,
        skills_to_offer: skills_to_offer_array,
        skills_to_learn: skills_to_learn_array
      });

      closeLoadingAlert();
      navigate('/dashboard');
    } catch (err) {
      closeLoadingAlert();
      // Los errores se manejan en AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light py-5">
      <div className="bg-white p-5 rounded-4 shadow-lg" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="text-center mb-4">
          <FaUserPlus size={60} className="text-primary" />
          <h1 className="h4 fw-bold text-dark mt-3">Crea tu cuenta</h1>
          <p className="text-muted small">Únete a la comunidad de intercambio de habilidades.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label fw-semibold text-secondary">Nombre Completo *</label>
            <input
              type="text"
              name="name"
              id="name"
              name="name"
              className="form-control rounded-pill"
              placeholder="Tu nombre completo"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold text-secondary">Correo Electrónico *</label>
            <input
              type="email"
              name="email"
              id="email"
              name="email"
              className="form-control rounded-pill"
              placeholder="tu@correo.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          {/* Campo de Teléfono */}
          <div className="mb-3">
            <label htmlFor="phone" className="form-label fw-semibold text-secondary">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-control rounded-pill"
              placeholder="+34 123 456 789"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          {/* Campo de Contraseña */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold text-secondary">
              Contraseña *
              <FaInfoCircle 
                className="ms-1 text-muted" 
                size={14} 
                title="Mínimo 6 caracteres, incluye mayúscula, minúscula y número"
              />
            </label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-control rounded-pill pe-5"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required
              />
              <button
                type="button"
                className="btn position-absolute top-50 end-0 translate-middle-y me-3 p-0 border-0 bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                style={{ zIndex: 10 }}
              >
                {showPassword ? (
                  <FaEyeSlash className="text-muted" />
                ) : (
                  <FaEye className="text-muted" />
                )}
              </button>
            </div>
          </div>
          {/* Campo de Biografía */}
          <div className="mb-3">
            <label htmlFor="bio" className="form-label fw-semibold text-secondary">Biografía</label>
            <textarea
              id="bio"
              name="bio"
              className="form-control"
              rows="3"
              placeholder="Cuéntanos un poco sobre ti..."
              value={formData.bio}
              onChange={handleChange}
              style={{ borderRadius: '15px' }}
            />
            <div className="form-text">Debe tener al menos 6 caracteres</div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="skillsToOffer" className="form-label text-secondary fw-semibold">
              Habilidades que ofreces
              <small className="text-muted ms-1">(separadas por comas)</small>
            </label>
            <input
              type="text"
              id="skillsToOffer"
              name="skillsToOffer"
              className="form-control rounded-pill"
              placeholder="Ej: Diseño Web, Cocina, Guitarra"
              value={formData.skillsToOffer}
              onChange={handleChange}
            />
            <div className="form-text">Opcional - separa con comas</div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="skillsToLearn" className="form-label text-secondary fw-semibold">
              Habilidades que quieres aprender
              <small className="text-muted ms-1">(separadas por comas)</small>
            </label>
            <input
              type="text"
              id="skillsToLearn"
              name="skillsToLearn"
              className="form-control rounded-pill"
              placeholder="Ej: Fotografía, Python, Francés"
              value={formData.skillsToLearn}
              onChange={handleChange}
            />
            <div className="form-text">Opcional - separa con comas</div>
          </div>
          <button
            type="submit"
            className="btn btn-primary fw-semibold rounded-pill shadow-sm w-100 py-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>
        
        <div className="text-center mt-3">
          <p className="text-muted">
            ¿Ya tienes una cuenta? <Link to="/login" className="text-decoration-none">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
