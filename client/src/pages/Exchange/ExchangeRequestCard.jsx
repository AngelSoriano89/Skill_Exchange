import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../../api/api.jsx';

const ExchangeRequestCard = ({ request, onUpdate }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/exchanges/accept/${request._id}`);
      onUpdate(); // Recarga la lista de solicitudes
    } catch (err) {
      console.error("Error al aceptar la solicitud:", err);
      setError("No se pudo aceptar la solicitud. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/exchanges/reject/${request._id}`);
      onUpdate(); // Recarga la lista de solicitudes
    } catch (err) {
      console.error("Error al rechazar la solicitud:", err);
      setError("No se pudo rechazar la solicitud. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-md-6 col-lg-4">
      <div className="card shadow-sm h-100">
        <div className="card-body">
          {error && <div className="alert alert-danger p-2 small">{error}</div>}
          <div className="d-flex align-items-center mb-3">
            {request.requester.avatar ? (
              <img
                src={`http://localhost:5000/uploads/${request.requester.avatar}`}
                alt="Avatar"
                className="rounded-circle me-3"
                style={{ width: '48px', height: '48px', objectFit: 'cover' }}
              />
            ) : (
              <FaUserCircle style={{ fontSize: '3rem', color: '#ccc' }} className="me-3" />
            )}
            <div>
              <h5 className="card-title fw-bold mb-0">{request.requester.name}</h5>
              <p className="card-subtitle text-muted small">Solicitud de intercambio</p>
            </div>
          </div>
          <p className="card-text">
            **Ofrece:** {request.skills_to_offer.join(', ')}
          </p>
          <p className="card-text">
            **Quiere aprender:** {request.skills_to_learn.join(', ')}
          </p>
          {request.message && (
            <p className="card-text small text-muted fst-italic">"{request.message}"</p>
          )}

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              className="btn btn-success btn-sm d-flex align-items-center"
              onClick={handleAccept}
              disabled={loading}
            >
              <FaCheckCircle className="me-1" /> Aceptar
            </button>
            <button
              className="btn btn-danger btn-sm d-flex align-items-center"
              onClick={handleReject}
              disabled={loading}
            >
              <FaTimesCircle className="me-1" /> Rechazar
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate(`/profile/${request.requester._id}`)}
              disabled={loading}
            >
              Ver Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRequestCard;
