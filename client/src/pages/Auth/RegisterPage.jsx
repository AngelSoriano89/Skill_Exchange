import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skillsToOffer, setSkillsToOffer] = useState('');
  const [skillsToLearn, setSkillsToLearn] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const skills_to_offer_array = skillsToOffer.split(',').map(skill => skill.trim()).filter(Boolean);
    const skills_to_learn_array = skillsToLearn.split(',').map(skill => skill.trim()).filter(Boolean);

    try {
      await api.post('/auth/register', { 
        name, 
        email, 
        password,
        skills_to_offer: skills_to_offer_array,
        skills_to_learn: skills_to_learn_array
      });

      alert('Registro exitoso. ¡Ahora puedes iniciar sesión!');
      navigate('/login');
    } catch (err) {
      console.error('Error de registro:', err);
      // Uso de encadenamiento opcional para un manejo de errores más seguro
      setError(
        err.response?.data?.msg ||
        'Ocurrió un error al registrarse. Por favor, intenta de nuevo.'
      );
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="bg-white p-5 rounded-4 shadow-lg" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="text-center mb-4">
          <h1 className="h4 fw-bold text-dark mt-3">Crea tu cuenta</h1>
          <p className="text-muted small">Únete a la comunidad de intercambio de habilidades.</p>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Campo de Nombre */}
          <div className="mb-3">
            <label htmlFor="name" className="form-label fw-semibold text-secondary">Nombre Completo</label>
            <input
              type="text"
              id="name"
              className="form-control rounded-pill"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {/* Campo de Correo */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold text-secondary">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              className="form-control rounded-pill"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {/* Campo de Contraseña */}
          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold text-secondary">Contraseña</label>
            <input
              type="password"
              id="password"
              className="form-control rounded-pill"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Habilidades que ofreces */}
          <div className="mb-3">
            <label htmlFor="skills_to_offer" className="form-label text-secondary fw-semibold">
              Habilidades que ofreces (separadas por comas)
            </label>
            <input
              type="text"
              id="skills_to_offer"
              className="form-control rounded-pill"
              placeholder="Ej. 'Diseño Web, Cocina'"
              value={skillsToOffer}
              onChange={(e) => setSkillsToOffer(e.target.value)}
            />
          </div>
          {/* Habilidades que quieres aprender */}
          <div className="mb-4">
            <label htmlFor="skills_to_learn" className="form-label text-secondary fw-semibold">
              Habilidades que quieres aprender (separadas por comas)
            </label>
            <input
              type="text"
              id="skills_to_learn"
              className="form-control rounded-pill"
              placeholder="Ej. 'Guitarra, Fotografía'"
              value={skillsToLearn}
              onChange={(e) => setSkillsToLearn(e.target.value)}
            />
          </div>
          {error && <div className="alert alert-danger text-center small">{error}</div>}
          <button
            type="submit"
            className="btn btn-primary fw-semibold rounded-pill shadow-sm w-100"
          >
            Regístrate
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
