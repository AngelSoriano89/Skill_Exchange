import React, { useState, useEffect, useContext } from 'react';
import { FaInbox, FaExchangeAlt, FaCheck, FaTimes, FaStar, FaPlus, FaEye, FaUserFriends, FaTachometerAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import exchangeService from '../../services/exchangeService';
import skillService from '../../services/skillService';
import { handleApiError, showSuccessAlert, showConfirmAlert } from '../../utils/sweetAlert';
import SkillGridCard from '../../components/Skills/SkillGridCard';

const DashboardPage = () => {
  const { user, loading: userLoading } = useContext(AuthContext);
  const [receivedExchanges, setReceivedExchanges] = useState([]);
  const [acceptedExchanges, setAcceptedExchanges] = useState([]);
  const [completedExchanges, setCompletedExchanges] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSkills: 0,
    activeExchanges: 0,
    completedExchanges: 0,
    averageRating: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [received, accepted, completed, skills] = await Promise.all([
          exchangeService.getReceivedExchanges(),
          exchangeService.getAcceptedExchanges(),
          exchangeService.getCompletedExchanges(),
          skillService.getMySkills()
        ]);

        setReceivedExchanges(received);
        setAcceptedExchanges(accepted);
        setCompletedExchanges(completed);
        setMySkills(skills);
        
        // Calcular estadísticas
        setStats({
          totalSkills: skills.length,
          activeExchanges: accepted.length,
          completedExchanges: completed.length,
          averageRating: user.averageRating || 0
        });

      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleAccept = async (exchangeId) => {
    const result = await showConfirmAlert(
      '¿Aceptar intercambio?',
      'Al aceptar, se desbloqueará tu información de contacto para coordinar el intercambio.'
    );
    
    if (result.isConfirmed) {
      try {
        await exchangeService.acceptExchange(exchangeId);
        
        // Mover de recibidas a aceptadas
        const acceptedExchange = receivedExchanges.find(ex => ex._id === exchangeId);
        setReceivedExchanges(prev => prev.filter(ex => ex._id !== exchangeId));
        setAcceptedExchanges(prev => [...prev, { ...acceptedExchange, status: 'accepted' }]);
        
        showSuccessAlert('¡Intercambio aceptado!', 'Ahora pueden contactarse para coordinar.');
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  const handleReject = async (exchangeId) => {
    const result = await showConfirmAlert(
      '¿Rechazar intercambio?',
      'Esta acción no se puede deshacer.'
    );
    
    if (result.isConfirmed) {
      try {
        await exchangeService.rejectExchange(exchangeId);
        setReceivedExchanges(prev => prev.filter(ex => ex._id !== exchangeId));
        showSuccessAlert('Intercambio rechazado', 'Se ha notificado al usuario.');
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  const handleEditSkill = (skill) => {
    // Navigate to edit page with skill data
    window.location.href = `/skills/edit/${skill._id}`;
  };

  const handleDeleteSkill = async (skill) => {
    const result = await showConfirmAlert(
      '¿Eliminar habilidad?',
      `¿Estás seguro de que quieres eliminar "${skill.title}"? Esta acción no se puede deshacer.`
    );
    
    if (result.isConfirmed) {
      try {
        await skillService.deleteSkill(skill._id);
        setMySkills(prev => prev.filter(s => s._id !== skill._id));
        setStats(prev => ({ ...prev, totalSkills: prev.totalSkills - 1 }));
        showSuccessAlert('Habilidad eliminada', 'La habilidad ha sido eliminada correctamente.');
      } catch (error) {
        handleApiError(error);
      }
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

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Header del Dashboard */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
            <div>
              <h1 className="h3 fw-bold text-dark mb-1">
                <FaTachometerAlt className="text-primary me-2" />
                Bienvenido, {user.name}!
              </h1>
              <p className="text-muted mb-0">Gestiona tus habilidades e intercambios</p>
            </div>
            <div className="d-flex gap-2 mt-3 mt-md-0">
              <Link to="/skills/add" className="btn btn-primary rounded-pill">
                <FaPlus className="me-2" size={14} />
                Publicar Habilidad
              </Link>
              <Link to="/search" className="btn btn-outline-primary rounded-pill">
                <FaEye className="me-2" size={14} />
                Explorar
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="row g-4 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <FaStar className="text-warning mb-2" size={24} />
              <h5 className="fw-bold text-dark mb-1">{stats.totalSkills}</h5>
              <small className="text-muted">Mis Habilidades</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <FaExchangeAlt className="text-primary mb-2" size={24} />
              <h5 className="fw-bold text-dark mb-1">{stats.activeExchanges}</h5>
              <small className="text-muted">Intercambios Activos</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <FaCheck className="text-success mb-2" size={24} />
              <h5 className="fw-bold text-dark mb-1">{stats.completedExchanges}</h5>
              <small className="text-muted">Completados</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <FaUserFriends className="text-info mb-2" size={24} />
              <h5 className="fw-bold text-dark mb-1">{stats.averageRating.toFixed(1)}</h5>
              <small className="text-muted">Rating Promedio</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Solicitudes Recibidas */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom-0">
              <h5 className="card-title d-flex align-items-center mb-0">
                <FaInbox className="text-primary me-2" />
                Solicitudes Recibidas
                {receivedExchanges.length > 0 && (
                  <span className="badge bg-danger ms-2">{receivedExchanges.length}</span>
                )}
              </h5>
            </div>
            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {receivedExchanges.length > 0 ? (
                receivedExchanges.map((request) => (
                  <div key={request._id} className="border rounded-3 p-3 mb-3 bg-light">
                    <div className="d-flex align-items-start justify-content-between mb-2">
                      <div className="d-flex align-items-center">
                        {request.sender.avatar ? (
                          <img
                            src={request.sender.avatar}
                            alt={request.sender.name}
                            className="rounded-circle me-3"
                            width="40"
                            height="40"
                          />
                        ) : (
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                            {request.sender.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h6 className="fw-bold mb-0">{request.sender.name}</h6>
                          <small className="text-muted">Solicitud de intercambio</small>
                        </div>
                      </div>
                    </div>
                    
                    {request.message && (
                      <p className="small text-muted mb-2 fst-italic">
                        "{request.message}"
                      </p>
                    )}
                    
                    <div className="mb-2">
                      <small className="text-muted d-block mb-1">Ofrece:</small>
                      {request.skills_to_offer.map((skill) => (
                        <span key={skill} className="badge bg-primary me-1 mb-1">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Quiere aprender:</small>
                      {request.skills_to_learn.map((skill) => (
                        <span key={skill} className="badge bg-success me-1 mb-1">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => handleAccept(request._id)}
                        className="btn btn-success btn-sm rounded-pill flex-fill"
                      >
                        <FaCheck className="me-1" /> Aceptar
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        className="btn btn-outline-danger btn-sm rounded-pill flex-fill"
                      >
                        <FaTimes className="me-1" /> Rechazar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <FaInbox className="text-muted mb-3" size={48} />
                  <p className="text-muted mb-0">No hay solicitudes pendientes.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Intercambios Activos */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom-0">
              <h5 className="card-title d-flex align-items-center mb-0">
                <FaExchangeAlt className="text-success me-2" />
                Intercambios Activos
                {acceptedExchanges.length > 0 && (
                  <span className="badge bg-success ms-2">{acceptedExchanges.length}</span>
                )}
              </h5>
            </div>
            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {acceptedExchanges.length > 0 ? (
                acceptedExchanges.map((exchange) => {
                  const otherUser = exchange.sender._id === user._id ? exchange.recipient : exchange.sender;
                  return (
                    <div key={exchange._id} className="border rounded-3 p-3 mb-3 bg-light">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center">
                          {otherUser.avatar ? (
                            <img
                              src={otherUser.avatar}
                              alt={otherUser.name}
                              className="rounded-circle me-3"
                              width="40"
                              height="40"
                            />
                          ) : (
                            <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                              {otherUser.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h6 className="fw-bold mb-0">{otherUser.name}</h6>
                            <small className="text-muted">Intercambio activo</small>
                          </div>
                        </div>
                        {otherUser.averageRating > 0 && (
                          <span className="badge bg-warning text-dark">
                            <FaStar size={12} /> {otherUser.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      
                      <div className="d-flex gap-2 mt-3">
                        <Link
                          to={`/contact/${exchange._id}`}
                          className="btn btn-primary btn-sm rounded-pill flex-fill"
                        >
                          <FaEye className="me-1" /> Ver Contacto
                        </Link>
                        <button 
                          className="btn btn-outline-success btn-sm rounded-pill flex-fill"
                          onClick={async () => {
                            const result = await showConfirmAlert(
                              '¿Marcar como completado?',
                              'Solo marca como completado si ya terminaron el intercambio.'
                            );
                            if (result.isConfirmed) {
                              try {
                                await exchangeService.completeExchange(exchange._id);
                                setAcceptedExchanges(prev => prev.filter(ex => ex._id !== exchange._id));
                                setCompletedExchanges(prev => [...prev, { ...exchange, status: 'completed' }]);
                                showSuccessAlert('¡Intercambio completado!', 'Ahora puedes calificar la experiencia.');
                              } catch (error) {
                                handleApiError(error);
                              }
                            }
                          }}
                        >
                          <FaCheck className="me-1" /> Completar
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <FaExchangeAlt className="text-muted mb-3" size={48} />
                  <p className="text-muted mb-3">No tienes intercambios activos.</p>
                  <Link to="/search" className="btn btn-outline-primary btn-sm rounded-pill">
                    <FaEye className="me-1" /> Buscar Intercambios
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mis Habilidades Publicadas */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title d-flex align-items-center mb-0">
                  <FaStar className="text-warning me-2" />
                  Mis Habilidades Publicadas
                  <span className="badge bg-primary ms-2">{mySkills.length}</span>
                </h5>
                <Link to="/skills/add" className="btn btn-primary btn-sm rounded-pill">
                  <FaPlus className="me-1" size={12} />
                  Agregar Nueva
                </Link>
              </div>
            </div>
            <div className="card-body">
              {mySkills.length > 0 ? (
                <>
                  <div className="row g-4">
                    {mySkills.slice(0, 6).map((skill) => (
                      <div key={skill._id} className="col-12 col-md-6 col-lg-4">
                        <SkillGridCard
                          skill={skill}
                          showActions={true}
                          onEdit={handleEditSkill}
                          onDelete={handleDeleteSkill}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {mySkills.length > 6 && (
                    <div className="row mt-4">
                      <div className="col-12 text-center">
                        <Link to={`/profile/${user._id}`} className="btn btn-outline-primary rounded-pill px-4">
                          <FaEye className="me-2" size={14} />
                          Ver todas mis habilidades ({mySkills.length})
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <FaStar className="text-muted mb-3" size={48} />
                  <h6 className="text-muted mb-3">Aún no has publicado ninguna habilidad</h6>
                  <p className="text-muted mb-4">Comparte tus conocimientos y habilidades con la comunidad</p>
                  <Link to="/skills/add" className="btn btn-primary rounded-pill px-4">
                    <FaPlus className="me-2" size={14} />
                    Publicar tu primera habilidad
                  </Link>
                </div>
              )}
            </div>
          </div>
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
