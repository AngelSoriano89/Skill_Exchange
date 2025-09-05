import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const RegisterPage = () => {
  const navigate = useNavigate();

  // Estados para cada campo del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skillsToOffer, setSkillsToOffer] = useState('');
  const [skillsToLearn, setSkillsToLearn] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    // Convertir las cadenas de habilidades a arrays
    const skills_to_offer_array = skillsToOffer.split(',').map(skill => skill.trim());
    const skills_to_learn_array = skillsToLearn.split(',').map(skill => skill.trim());

    try {
      // Envía los datos del usuario al backend
      await api.post('/auth/register', { 
        name, 
        email, 
        password,
        skills_to_offer: skills_to_offer_array,
        skills_to_learn: skills_to_learn_array
      });

      // Muestra un mensaje de éxito y redirige al login
      alert('Registro exitoso. ¡Ahora puedes iniciar sesión!');
      navigate('/login');
    } catch (err) {
      console.error('Error al registrar el usuario:', err);
      // Muestra el mensaje de error del backend o uno genérico
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Ocurrió un error al intentar registrarte. Por favor, intenta de nuevo.');
      }
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center bg-light">
      <div className="bg-white p-5 rounded-4 shadow-lg w-100" style={{ maxWidth: '400px' }}>
        <h2 className="fs-3 fw-bold text-center text-dark mb-4">Regístrate</h2>
        <form onSubmit={handleSubmit}>
          {/* Campo de Nombre */}
          <div className="mb-3">
            <label htmlFor="name" className="form-label text-secondary fw-semibold">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {/* Campo de Correo */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label text-secondary fw-semibold">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {/* Campo de Contraseña */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label text-secondary fw-semibold">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
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
              className="form-control"
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
              className="form-control"
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
