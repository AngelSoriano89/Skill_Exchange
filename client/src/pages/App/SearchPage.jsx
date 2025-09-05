import React from 'react';

const SearchPage = () => {
  return (
    <div id="search-page" className="page w-100 p-4">
      <div className="container">
        <h1 className="h2 fw-bold text-dark text-center mb-4">
          Encuentra tu próximo intercambio
        </h1>
        <div className="d-flex justify-content-center mb-4">
          <div className="input-group" style={{ maxWidth: '600px' }}>
            <span className="input-group-text bg-white border-end-0">&#x1f50e;&#xfe0e;</span>
            <input
              type="text"
              placeholder="Buscar por habilidad (ej. Piano, Cocina, Programación)"
              className="form-control border-start-0 py-2 rounded-pill"
            />
          </div>
        </div>
        <div className="row g-4 justify-content-center">
          {/* User Card */}
          <div className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="card shadow-sm p-4 text-center h-100">
              <h3 className="h5 fw-semibold text-dark mb-2">María López</h3>
              <p className="text-muted small mb-3">¡Maestra de cocina!</p>
              <div className="mb-3">
                <h4 className="fw-semibold text-secondary mb-1">Ofrece:</h4>
                <div className="d-flex flex-wrap justify-content-center gap-1">
                  <span className="badge bg-info text-dark">Cocina</span>
                  <span className="badge bg-info text-dark">Repostería</span>
                </div>
              </div>
              <div className="mb-3">
                <h4 className="fw-semibold text-secondary mb-1">Quiere Aprender:</h4>
                <div className="d-flex flex-wrap justify-content-center gap-1">
                  <span className="badge bg-success">Idiomas</span>
                </div>
              </div>
              <button className="btn btn-primary rounded-pill mt-auto">Ver Perfil</button>
            </div>
          </div>
          {/* /User Card */}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
