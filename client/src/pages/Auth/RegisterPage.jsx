import React from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  // Inicializa el hook para la navegación
  const navigate = useNavigate();

  // Función para manejar el envío del formulario
  const handleRegister = (event) => {
    event.preventDefault(); // Evita que el formulario se envíe y recargue la página
    // Aquí iría la lógica para registrar al usuario,
    // como la autenticación con Firebase.
    
    // Una vez que el registro sea exitoso, redirige al usuario al login.
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center bg-light">
      <div className="bg-white p-5 rounded-4 shadow-lg w-100" style={{ maxWidth: '400px' }}>
        <h2 className="fs-3 fw-bold text-center text-dark mb-4">Regístrate</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label text-secondary fw-semibold">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label text-secondary fw-semibold">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label text-secondary fw-semibold">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="skills_to_offer" className="form-label text-secondary fw-semibold">
              Habilidades que ofreces (separadas por comas)
            </label>
            <input
              type="text"
              id="skills_to_offer"
              className="form-control"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="skills_to_learn" className="form-label text-secondary fw-semibold">
              Habilidades que quieres aprender (separadas por comas)
            </label>
            <input
              type="text"
              id="skills_to_learn"
              className="form-control"
            />
          </div>
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
