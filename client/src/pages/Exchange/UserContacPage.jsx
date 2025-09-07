import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';
import { FaEnvelope, FaPhone, FaCheckCircle } from 'react-icons/fa';

const UserContactPage = () => {
  const { exchangeId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExchangeDetails = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/exchanges/${exchangeId}`);
        setExchange(res.data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la información del intercambio.');
      } finally {
        setLoading(false);
      }
    };
    fetchExchangeDetails();
  }, [exchangeId, user]);

  const handleCompleteExchange = async () => {
    try {
      await api.put(`/exchanges/complete/${exchangeId}`);
      alert('Intercambio marcado como completado. ¡Aprende mucho!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Error al completar el intercambio.');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="fs-5 text-secondary">Cargando detalles del intercambio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="alert alert-danger shadow-sm" role="alert">{error}</div>
      </div>
    );
  }

  const otherUser = exchange.sender._id === user._id ? exchange.recipient : exchange.sender;

  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light p-3">
      <div className="card shadow-lg p-4 p-sm-5 text-center w-100" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          <h1 className="h3 fw-bold text-dark mb-3">¡Intercambio Aceptado!</h1>
          <p className="lead text-secondary mb-4">
            Ahora puedes contactar a <span className="fw-semibold">{otherUser.name}</span> para coordinar.
          </p>

          <div className="bg-light p-4 rounded-3 mb-4">
            <h2 className="h5 fw-bold text-dark mb-3">Información de Contacto</h2>
            <div className="d-flex flex-column align-items-center gap-2">
              <p className="text-dark d-flex align-items-center mb-0">
                <FaEnvelope className="me-2 text-primary" />
                <span className="fw-semibold">Correo:</span> {otherUser.email}
              </p>
              {otherUser.phone && (
                <p className="text-dark d-flex align-items-center mb-0">
                  <FaPhone className="me-2 text-success" />
                  <span className="fw-semibold">Teléfono:</span> {otherUser.phone}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleCompleteExchange}
            className="btn btn-success fw-semibold py-3 px-4 rounded-pill shadow-sm"
          >
            <FaCheckCircle className="d-inline-block me-2" />
            Marcar Intercambio como Completado
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserContactPage;
