import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myExchanges, setMyExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [pendingRes, exchangesRes] = await Promise.all([
        api.get('/exchanges/pending'),
        api.get('/exchanges/my-requests')
      ]);
      
      setPendingRequests(pendingRes.data);
      setMyExchanges(exchangesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setActionLoading(true);
    try {
      await api.put(`/exchanges/accept/${requestId}`);
      await fetchDashboardData(); // Recargar datos
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Error al aceptar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setActionLoading(true);
    try {
      await api.put(`/exchanges/reject/${requestId}`);
      await fetchDashboardData(); // Recargar datos
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error al rechazar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'bg-warning text-dark', text: 'Pendiente' },
      'accepted': { class: 'bg-success', text: 'Aceptado' },
      'rejected': { class: 'bg-danger', text: 'Rechazado' },
      'completed': { class: 'bg-info', text: 'Completado' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  // Filtrar intercambios por estado
  const acceptedExchanges = myExchanges.filter(ex => ex.status === 'accepted');
  const completedExchanges = myExchanges.filter(ex => ex.status === 'completed');
  const sentRequests = myExchanges.filter(ex => ex.sender._id === user._id && ex.status === 'pending');

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      <div className="row">
        <div className="col-12 mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h2 mb-0 text-dark">
              ¡Bienvenido de vuelta, <span className="text-primary">{user?.name}</span>! 👋
            </h1>
            
          </div>
          <p className="text-muted mb-0">Aquí tienes un resumen de tu actividad reciente</p>
        </div>
      </div>

      {/* Cards de estadísticas rápidas */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body text-center">
              <h3 className="card-title">{pendingRequests.length}</h3>
              <p className="card-text">Solicitudes Pendientes</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body text-center">
              <h3 className="card-title">{acceptedExchanges.length}</h3>
              <p className="card-text">Intercambios Activos</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body text-center">
              <h3 className="card-title">{completedExchanges.length}</h3>
              <p className="card-text">Completados</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-dark h-100">
            <div className="card-body text-center">
              <h3 className="card-title">{sentRequests.length}</h3>
              <p className="card-text">Enviadas</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        {/* Solicitudes Recibidas */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="fas fa-inbox text-primary me-2"></i>
                Solicitudes Recibidas ({pendingRequests.length})
              </h5>
            </div>
            <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3 mb-0">No tienes solicitudes pendientes</p>
                  <small className="text-muted">Las nuevas solicitudes aparecerán aquí</small>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div key={request._id} className="border rounded p-3 mb-3 bg-light">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                               style={{ width: '32px', height: '32px', fontSize: '14px', fontWeight: 'bold' }}>
                            {request.sender.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h6 className="mb-0 fw-bold">{request.sender.name}</h6>
                            <small className="text-muted">{formatDate(request.date)}</small>
                          </div>
                        </div>
                        
                        <p className="small text-dark mb-2">
                          <strong>Mensaje:</strong> {request.message}
                        </p>
                        
                        <div className="mb-2">
                          <div className="small mb-1">
                            <strong>Ofrece:</strong>
                            <div>
                              {request.skills_to_offer.map((skill, index) => (
                                <span key={index} className="badge bg-primary me-1">{skill}</span>
                              ))}
                            </div>
                          </div>
                          <div className="small">
                            <strong>Quiere aprender:</strong>
                            <div>
                              {request.skills_to_learn.map((skill, index) => (
                                <span key={index} className="badge bg-success me-1">{skill}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setSelectedRequest(request)}
                        disabled={actionLoading}
                      >
                        Ver más
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Mis Intercambios */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="fas fa-exchange-alt text-success me-2"></i>
                Mis Intercambios
              </h5>
            </div>
            <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {myExchanges.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-handshake text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3 mb-0">No tienes intercambios aún</p>
                  <Link to="/search" className="btn btn-primary btn-sm mt-2">
                    Buscar personas para intercambiar
                  </Link>
                </div>
              ) : (
                myExchanges.map((exchange) => {
                  const isReceived = exchange.recipient._id === user._id;
                  const otherUser = isReceived ? exchange.sender : exchange.recipient;
                  
                  return (
                    <div key={exchange._id} className="border rounded p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                 style={{ width: '32px', height: '32px', fontSize: '14px', fontWeight: 'bold' }}>
                              {otherUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-0">
                                {isReceived ? 'Solicitud de' : 'Enviado a'} {otherUser.name}
                              </h6>
                              <div className="d-flex align-items-center">
                                <small className="text-muted me-2">{formatDate(exchange.date)}</small>
                                {getStatusBadge(exchange.status)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="small">
                            <div className="mb-1">
                              <strong>Ofrece:</strong> {exchange.skills_to_offer.join(', ')}
                            </div>
                            <div>
                              <strong>Quiere:</strong> {exchange.skills_to_learn.join(', ')}
                            </div>
                          </div>
                        </div>
                        
                        {exchange.status === 'accepted' && (
                          <Link 
                            to={`/exchange/${exchange._id}/contact`}
                            className="btn btn-success btn-sm"
                          >
                            Contactar
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para ver solicitud completa */}
      {selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-user-circle text-primary me-2"></i>
                  Solicitud de {selectedRequest.sender.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setSelectedRequest(null)}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    <div className="mb-3">
                      <strong className="text-primary">📝 Mensaje:</strong>
                      <p className="mt-1 p-3 bg-light rounded">{selectedRequest.message}</p>
                    </div>
                    
                    <div className="mb-3">
                      <strong className="text-success">🎯 Habilidades que ofrece:</strong>
                      <div className="mt-2">
                        {selectedRequest.skills_to_offer.map((skill, index) => (
                          <span key={index} className="badge bg-primary me-2 mb-1 p-2">{skill}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <strong className="text-info">📚 Quiere aprender:</strong>
                      <div className="mt-2">
                        {selectedRequest.skills_to_learn.map((skill, index) => (
                          <span key={index} className="badge bg-success me-2 mb-1 p-2">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="text-center">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                           style={{ width: '80px', height: '80px', fontSize: '2rem', fontWeight: 'bold' }}>
                        {selectedRequest.sender.name.charAt(0).toUpperCase()}
                      </div>
                      <h5>{selectedRequest.sender.name}</h5>
                      <p className="text-muted small">{selectedRequest.sender.email}</p>
                      
                      <Link 
                        to={`/profile/${selectedRequest.sender._id}`}
                        className="btn btn-outline-info btn-sm w-100 mb-2"
                        target="_blank"
                      >
                        <i className="fas fa-user me-2"></i>
                        Ver Perfil Completo
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={() => handleAcceptRequest(selectedRequest._id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Aceptar Intercambio
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleRejectRequest(selectedRequest._id)}
                  disabled={actionLoading}
                >
                  <i className="fas fa-times me-2"></i>
                  Rechazar
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setSelectedRequest(null)}
                  disabled={actionLoading}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
