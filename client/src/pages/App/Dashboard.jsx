import React from 'react';

const DashboardPage = () => {
  return (
    <div id="dashboard-page" className="page w-100 p-4">
      <div className="container-fluid">
        <h1 className="display-4 fw-bold text-dark mb-4 text-center">Bienvenido, Alex</h1>
        <div className="row g-4">
          {/* Solicitudes Recibidas */}
          <div className="col-12 col-lg-6">
            <div className="bg-white rounded-3 shadow-sm p-4 h-100">
              <h2 className="h4 fw-semibold text-secondary mb-3 d-flex align-items-center">
                <span className="me-2">&#9993;</span> Solicitudes Recibidas
              </h2>
              <div className="border-bottom border-gray-200 py-3">
                <p className="fw-medium fs-5 text-dark">
                  <span className="fw-bold">Juan</span> quiere intercambiar
                </p>
                <div className="mt-2 text-muted small">
                  <p>Ofrece: <span className="badge bg-primary text-wrap rounded-pill px-2 py-1">Desarrollo Web</span></p>
                  <p>Quiere aprender: <span className="badge bg-success text-wrap rounded-pill px-2 py-1">Cocina</span></p>
                </div>
                <div className="mt-4 d-flex gap-2">
                  <button className="btn btn-success rounded-pill">Aceptar</button>
                  <button className="btn btn-danger rounded-pill">Rechazar</button>
                </div>
              </div>
            </div>
          </div>
          {/* /Solicitudes Recibidas */}

          {/* Mis Intercambios */}
          <div className="col-12 col-lg-6">
            <div className="bg-white rounded-3 shadow-sm p-4 h-100">
              <h2 className="h4 fw-semibold text-secondary mb-3 d-flex align-items-center">
                <span className="me-2">&#x21c4;</span> Mis Intercambios
              </h2>
              <p className="text-muted">
                Aquí se mostrarán tus intercambios aceptados y completados.
              </p>
            </div>
          </div>
          {/* /Mis Intercambios */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
