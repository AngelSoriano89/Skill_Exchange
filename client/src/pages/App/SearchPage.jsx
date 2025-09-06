import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SearchPage = () => {
  // Datos de ejemplo para la lista de usuarios. En el futuro,
  // aquí usarás el estado de React para mostrar los usuarios de la API.
  const sampleUsers = [
    {
      id: 1,
      name: 'María López',
      bio: '¡Maestra de cocina!',
      skillsToOffer: ['Cocina', 'Repostería'],
      skillsToLearn: ['Idiomas'],
    },
    {
      id: 2,
      name: 'Carlos Ruiz',
      bio: 'Desarrollador full-stack y amante del café.',
      skillsToOffer: ['React', 'Node.js', 'MongoDB'],
      skillsToLearn: ['Piano'],
    },
    {
      id: 3,
      name: 'Ana García',
      bio: 'Diseñadora gráfica en busca de nuevas habilidades.',
      skillsToOffer: ['Photoshop', 'Ilustración'],
      skillsToLearn: ['Fotografía'],
    },
  ];

  return (
    <div className="d-flex flex-column align-items-center bg-light w-100 p-4 min-vh-100">
      <div className="container py-5">
        <h1 className="h2 fw-bold text-dark text-center mb-4">
          Encuentra tu próximo intercambio
        </h1>
        <div className="d-flex justify-content-center mb-5">
          <div className="input-group" style={{ maxWidth: '600px' }}>
            <span className="input-group-text bg-white border-end-0 border-rounded-end">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Buscar por habilidad (ej. Piano, Cocina, Programación)"
              className="form-control border-start-0 py-2"
            />
            <button className="btn btn-primary rounded-end-pill px-4">
              Buscar
            </button>
          </div>
        </div>
        
        <div className="row g-4 justify-content-center">
          {sampleUsers.map((user) => (
            <div key={user.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 rounded-4 shadow-sm text-center p-3 hover-lift">
                <div className="card-body d-flex flex-column">
                  <h3 className="h5 fw-semibold text-dark mb-2">{user.name}</h3>
                  <p className="text-muted small mb-3 flex-grow-1">{user.bio}</p>
                  
                  <div className="mb-3">
                    <h4 className="fw-semibold text-secondary mb-1 small">Ofrece:</h4>
                    <div className="d-flex flex-wrap justify-content-center gap-1">
                      {user.skillsToOffer.map((skill, index) => (
                        <span key={index} className="badge bg-primary text-wrap fw-normal">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="fw-semibold text-secondary mb-1 small">Quiere Aprender:</h4>
                    <div className="d-flex flex-wrap justify-content-center gap-1">
                      {user.skillsToLearn.map((skill, index) => (
                        <span key={index} className="badge bg-success text-wrap fw-normal">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <Link to={`/profile/${user.id}`} className="btn btn-primary rounded-pill mt-auto">
                    Ver Perfil
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;