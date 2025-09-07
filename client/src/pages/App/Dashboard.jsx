import React, { useState, useEffect, useContext } from 'react';
import { FaInbox, FaExchangeAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user, loading: userLoading } = useContext(AuthContext);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        const res = await api.get('/exchanges/my-requests');
        setExchanges(res.data);
      } catch (err) {
        console.error('Error al obtener los intercambios:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchExchanges();
    }
  }, [user]);

  const handleAccept = async (exchangeId) => {
    try {
      await api.put(`/exchanges/accept/${exchangeId}`);
      setExchanges(exchanges.map(ex => ex._id === exchangeId ? { ...ex, status: 'accepted' } : ex));
      alert('Solicitud aceptada. ¡Ahora pueden contactarse!');
    } catch (err) {
      console.error('Error al aceptar la solicitud:', err);
    }
  };

  const handleReject = async (exchangeId) => {
    try {
      await api.put(`/exchanges/reject/${exchangeId}`);
      setExchanges(exchanges.map(ex => ex._id === exchangeId ? { ...ex, status: 'rejected' } : ex));
      alert('Solicitud rechazada.');
    } catch (err) {
      console.error('Error al rechazar la solicitud:', err);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Filtra las solicitudes que el usuario actual RECIBIÓ y que están pendientes
  const receivedRequests = exchanges.filter(
    (ex) => ex.recipient._id === user.id && ex.status === 'pending'
  );
  
  // Filtra los intercambios aceptados (para ambos roles, tanto el que envía como el que recibe)
  const acceptedExchanges = exchanges.filter(
    (ex) => ex.status === 'accepted'
  );

  return (
    <div id="dashboard-page" className="page w-100 p-4 bg-light">
      <div className="container-fluid">
        <h1 className="display-4 fw-bold text-dark mb-4 text-center">
          Bienvenido, {user.name}
        </h1>
        <div className="row g-4">
          {/* Solicitudes Recibidas */}
          <div className="col-12 col-lg-6">
            <div className="card rounded-3 shadow-sm h-100">
              <div className="card-body">
                <h2 className="card-title h4 fw-semibold text-secondary d-flex align-items-center mb-3">
                  <FaInbox className="me-2" /> Solicitudes Recibidas
                </h2>
                {receivedRequests.length > 0 ? (
                  receivedRequests.map((request) => (
                    <div
                      key={request._id}
                      className="border-bottom border-gray-200 py-3 mb-3"
                    >
                      <p className="fw-medium fs-5 text-dark">
                        <span className="fw-bold">{request.sender.name}</span>{' '}
                        quiere intercambiar:
                      </p>
                      <div className="mt-2 text-muted small">
                        <p className="mb-1">
                          Ofrece:{' '}
                          {request.skills_to_offer.map((skill) => (
                            <span
                              key={skill}
                              className="badge bg-primary text-wrap me-1"
                            >
                              {skill}
                            </span>
                          ))}
                        </p>
                        <p className="mb-0">
                          Quiere aprender:{' '}
                          {request.skills_to_learn.map((skill) => (
                            <span
                              key={skill}
                              className="badge bg-success text-wrap me-1"
                            >
                              {skill}
                            </span>
                          ))}
                        </p>
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        <button
                          onClick={() => handleAccept(request._id)}
                          className="btn btn-success btn-sm rounded-pill d-flex align-items-center"
                        >
                          <FaCheck className="me-1" /> Aceptar
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="btn btn-danger btn-sm rounded-pill d-flex align-items-center"
                        >
                          <FaTimes className="me-1" /> Rechazar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center small mt-3">
                    No hay solicitudes pendientes.
                  </p>
                )}
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
                {acceptedExchanges.length > 0 ? (
                  acceptedExchanges.map((exchange) => {
                    // Determinar el otro usuario y la URL de contacto
                    const otherUser =
                      exchange.sender._id === user.id
                        ? exchange.recipient
                        : exchange.sender;
                    const contactUrl = `/contact/${exchange._id}`;
                    return (
                      <div
                        key={exchange._id}
                        className="border-bottom border-gray-200 py-3 mb-3"
                      >
                        <p className="fw-medium fs-5 text-dark">
                          Intercambio con{' '}
                          <span className="fw-bold">{otherUser.name}</span>
                        </p>
                        <p className="text-muted small">
                          **Haz clic para ver la información de contacto y coordinar.**
                        </p>
                        <Link
                          to={contactUrl}
                          className="btn btn-outline-primary btn-sm rounded-pill mt-2"
                        >
                          Ver Detalles
                        </Link>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center mt-5">
                    <p className="text-muted small">
                      Aún no tienes intercambios activos.
                    </p>
                    <Link
                      to="/search"
                      className="btn btn-outline-primary btn-sm rounded-pill mt-2"
                    >
                      Buscar Intercambios
                    </Link>
                  </div>
                )}
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
