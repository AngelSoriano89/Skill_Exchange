import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api'; // CORREGIDO: import default en lugar de destructuring
import { AuthContext } from '../../context/AuthContext';
import { FaEnvelope, FaPhone, FaCheckCircle } from 'react-icons/fa';

const UserContactPage = () => {
  const { exchangeId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (user && exchangeId) {
      fetchExchangeDetails();
    }
  }, [exchangeId, user]);

  const fetchExchangeDetails = async () => {
    try {
      const res = await api.get(`/exchanges/${exchangeId}`);
      setExchange(res.data);
    } catch (err) {
      console.error('Error fetching exchange details:', err);
      setError('No se pudo cargar la información del intercambio.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteExchange = async () => {
    setCompleting(true);
    try {
      await api.put(`/exchanges/complete/${exchangeId}`);
      alert('¡Intercambio marcado como completado exitosamente! 🎉');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error completing exchange:', err);
      alert('Error al completar el intercambio. Intenta de nuevo.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando detalles del intercambio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!exchange) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <p className="text-muted">Intercambio no encontrado</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const otherUser = exchange.sender._id === user._id ? exchange.recipient : exchange.sender;

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-4">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-header bg-success text-white text-center py-4 rounded-top-4">
            <h1 className="h2 mb-0">
              <i className="fas fa-check-circle me-2"></i>
              ¡Intercambio Aceptado!
            </h1>
          </div>
          
          <div className="card-body p-5 text-center">
            <div className="row align-items-center">
              <div className="col-md-4 mb-4 mb-md-0">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                     style={{ width: '100px', height: '100px', fontSize: '2.5rem', fontWeight: 'bold' }}>
                  {otherUser.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-dark">{otherUser.name}</h3>
              </div>
              
              <div className="col-md-8">
                <p className="lead text-muted mb-4">
                  Ahora pueden contactarse directamente para coordinar su intercambio de habilidades.
                </p>
                
                <div className="bg-light p-4 rounded-3 mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    Información de Contacto
                  </h5>
                  
                  <div className="row text-start">
                    <div className="col-sm-6 mb-3">
                      <div className="d-flex align-items-center">
                        <FaEnvelope className="text-primary me-2" />
                        <div>
                          <small className="text-muted d-block">Correo Electrónico:</small>
                          <strong>{otherUser.email}</strong>
                        </div>
                      </div>
                    </div>
                    
                    {otherUser.phone && (
                      <div className="col-sm-6 mb-3">
                        <div className="d-flex align-items-center">
                          <FaPhone className="text-success me-2" />
                          <div>
                            <small className="text-muted d-block">Teléfono:</small>
                            <strong>{otherUser.phone}</strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-info bg-opacity-10 p-4 rounded-3 mb-4">
                  <h6 className="text-info mb-2">
                    <i className="fas fa-exchange-alt me-2"></i>
                    Detalles del Intercambio
                  </h6>
                  <div className="row text-start">
                    <div className="col-md-6 mb-2">
                      <small className="text-muted">Habilidades ofrecidas:</small>
                      <div>
                        {exchange.skills_to_offer.map((skill, index) => (
                          <span key={index} className="badge bg-primary me-1 mb-1">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <small className="text-muted">Habilidades solicitadas:</small>
                      <div>
                        {exchange.skills_to_learn.map((skill, index) => (
                          <span key={index} className="badge bg-success me-1 mb-1">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="alert alert-warning" role="alert">
                <i className="fas fa-lightbulb me-2"></i>
                <strong>Consejo:</strong> Una vez que hayan completado su intercambio de habilidades, 
                no olviden marcar el intercambio como completado usando el botón de abajo.
              </div>
              
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <a 
                  href={`mailto:${otherUser.email}?subject=Intercambio de Habilidades - Skill Exchange&body=¡Hola ${otherUser.name}! Te contacto sobre nuestro intercambio de habilidades...`}
                  className="btn btn-primary btn-lg rounded-pill px-4"
                >
                  <FaEnvelope className="me-2" />
                  Enviar Email
                </a>
                
                <button
                  onClick={handleCompleteExchange}
                  className="btn btn-success btn-lg rounded-pill px-4"
                  disabled={completing}
                >
                  {completing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Marcando como completado...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="me-2" />
                      Marcar como Completado
                    </>
                  )}
                </button>
              </div>
              
              <button 
                className="btn btn-outline-secondary mt-3"
                onClick={() => navigate('/dashboard')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserContactPage;
