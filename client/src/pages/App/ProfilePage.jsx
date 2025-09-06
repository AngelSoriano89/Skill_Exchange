import React from 'react';
import { FaUserCircle, FaEdit, FaPlus, FaLaptopCode, FaBookReader } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();

  // Datos de ejemplo para el perfil
  const userProfile = {
    name: 'Alex Sánchez',
    bio: 'Me encanta la programación y el diseño. Busco aprender a tocar la guitarra.',
    skillsToOffer: ['JavaScript', 'Node.js', 'MongoDB'],
    skillsToLearn: ['Guitarra', 'Fotografía'],
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleAddSkill = () => {
    navigate('/skills/add');
  };

  return (
    <div className="d-flex flex-column align-items-center bg-light w-100 p-4 min-vh-100">
      <div className="container py-5">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-4 p-md-5">
            {/* Encabezado del Perfil */}
            <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start mb-4">
              <div 
                className="bg-light rounded-circle me-sm-4 mb-3 mb-sm-0 d-flex justify-content-center align-items-center"
                style={{ width: '120px', height: '120px', border: '3px solid #0d6efd' }}
              >
                <FaUserCircle size={100} className="text-muted" />
              </div>
              <div className="text-center text-sm-start">
                <h1 className="h2 fw-bold text-dark mb-1">{userProfile.name}</h1>
                <p className="lead text-muted mb-3">{userProfile.bio}</p>
                <div className="d-flex flex-wrap justify-content-center justify-content-sm-start gap-2">
                  <button onClick={handleEditProfile} className="btn btn-outline-secondary rounded-pill px-4 py-2">
                    <FaEdit className="me-1" /> Editar Perfil
                  </button>
                  <button onClick={handleAddSkill} className="btn btn-primary rounded-pill px-4 py-2">
                    <FaPlus className="me-1" /> Añadir Habilidad
                  </button>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            {/* Sección de Habilidades */}
            <div className="row g-4">
              {/* Habilidades que Ofrece */}
              <div className="col-12 col-md-6">
                <h2 className="h5 fw-bold text-dark mb-3 d-flex align-items-center">
                  <FaLaptopCode className="me-2 text-primary" /> Ofrece
                </h2>
                <div className="d-flex flex-wrap gap-2">
                  {userProfile.skillsToOffer.map((skill, index) => (
                    <span 
                      key={index} 
                      className="badge bg-primary text-wrap rounded-pill px-3 py-2 fw-normal"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              {/* Habilidades que Quiere Aprender */}
              <div className="col-12 col-md-6">
                <h2 className="h5 fw-bold text-dark mb-3 d-flex align-items-center">
                  <FaBookReader className="me-2 text-success" /> Quiere Aprender
                </h2>
                <div className="d-flex flex-wrap gap-2">
                  {userProfile.skillsToLearn.map((skill, index) => (
                    <span 
                      key={index} 
                      className="badge bg-success text-wrap rounded-pill px-3 py-2 fw-normal"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

