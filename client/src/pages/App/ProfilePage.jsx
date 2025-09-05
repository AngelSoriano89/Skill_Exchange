import React from 'react';

const ProfilePage = () => {
  return (
    <div id="profile-page" className="page w-100 p-4">
      <div className="container py-4">
        <div className="card shadow-sm p-4">
          {/* Profile Header Section */}
          <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start mb-4">
            <div className="profile-avatar bg-light rounded-circle me-sm-4 mb-3 mb-sm-0 d-flex justify-content-center align-items-center" style={{ width: '120px', height: '120px' }}>
              {/* Optional: Add user's initial or profile picture */}
            </div>
            <div className="text-center text-sm-start">
              <h1 className="h2 fw-bold text-dark mb-1">Alex Sánchez</h1>
              <p className="lead text-muted mb-3">Me encanta la programación y el diseño. Busco aprender a tocar la guitarra.</p>
              <div className="d-flex flex-wrap justify-content-center justify-content-sm-start gap-2">
                <button className="btn btn-outline-secondary rounded-pill px-4 py-2">
                  <span className="me-1">&#9999;</span> Editar Perfil
                </button>
                <button className="btn btn-primary rounded-pill px-4 py-2">
                  <span className="me-1">&#x2b;</span> Añadir Habilidad
                </button>
              </div>
            </div>
          </div>
          {/* --- */}
          {/* Skills Section */}
          <hr className="my-4" />
          <div className="w-100">
            <h2 className="h4 fw-bold text-dark mb-3">Habilidades</h2>
            <div className="row g-4">
              <div className="col-12 col-md-6">
                <h3 className="h5 fw-bold text-secondary mb-2">Ofrece</h3>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-primary text-wrap rounded-pill px-3 py-1">JavaScript</span>
                  <span className="badge bg-primary text-wrap rounded-pill px-3 py-1">Node.js</span>
                  <span className="badge bg-primary text-wrap rounded-pill px-3 py-1">MongoDB</span>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <h3 className="h5 fw-bold text-secondary mb-2">Quiere Aprender</h3>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-success text-wrap rounded-pill px-3 py-1">Guitarra</span>
                  <span className="badge bg-success text-wrap rounded-pill px-3 py-1">Fotografía</span>
                </div>
              </div>
            </div>
          </div>
          {/* --- */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
