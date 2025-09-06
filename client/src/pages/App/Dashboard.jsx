import React from 'react';
import { FaInbox, FaExchangeAlt } from 'react-icons/fa'; // Iconos de React-icons

const DashboardPage = () => {
  return (
    <div id="dashboard-page" className="page w-100 p-4 bg-light">
      <div className="container-fluid">
        <h1 className="display-4 fw-bold text-dark mb-4 text-center">Bienvenido, Alex</h1>
        <div className="row g-4">
          {/* Solicitudes Recibidas */}
          <div className="col-12 col-lg-6">
            <div className="card rounded-3 shadow-sm h-100">
              <div className="card-body">
                <h2 className="card-title h4 fw-semibold text-secondary d-flex align-items-center mb-3">
                  <FaInbox className="me-2" /> Solicitudes Recibidas
                </h2>
                {/* Ejemplo de Solicitud de Intercambio */}
                <div className="border-bottom border-gray-200 py-3 mb-3">
                  <p className="fw-medium fs-5 text-dark">
                    <span className="fw-bold">Juan</span> quiere intercambiar
                  </p>
                  <div className="mt-2 text-muted small">
                    <p className="mb-1">Ofrece: <span className="badge bg-primary text-wrap">Desarrollo Web</span></p>
                    <p className="mb-0">Quiere aprender: <span className="badge bg-success text-wrap">Cocina</span></p>
                  </div>
                  <div className="mt-4 d-flex gap-2">
                    <button className="btn btn-success btn-sm rounded-pill">Aceptar</button>
                    <button className="btn btn-danger btn-sm rounded-pill">Rechazar</button>
                  </div>
                </div>
                {/* Aquí irían más solicitudes */}
                <p className="text-muted text-center small mt-3">No hay más solicitudes por el momento.</p>
              </div>
            </div>
          </div>
          {/* /Solicitudes Recibidas */}

          {/* Mis Intercambios */}
          <div className="col-12 col-lg-6">
            <div className="card rounded-3 shadow-sm h-100">
              <div className="card-body">
                <h2 className="card-title h4 fw-semibold text-secondary d-flex align-items-center mb-3">
                  <FaExchangeAlt className="me-2" /> Mis Intercambios
                </h2>
                <p className="text-muted">
                  Aquí se mostrarán tus intercambios aceptados y completados.
                </p>
                <div className="text-center mt-5">
                  <p className="text-muted small">Aún no tienes intercambios activos.</p>
                  <a href="/search" className="btn btn-outline-primary btn-sm rounded-pill mt-2">
                    Buscar Intercambios
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* /Mis Intercambios */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
