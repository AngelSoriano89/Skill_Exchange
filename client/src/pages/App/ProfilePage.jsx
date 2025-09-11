import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ExchangeRequestModal from '../Exchange/ExchangeRequestModal';
import EditProfileModal from './EditProfileModal';
import api from '../../api/api';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useContext(AuthContext);
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [exchanges, setExchanges] = useState([]);

  // Si no hay ID en la URL, mostrar perfil del usuario actual
  const profileId = id || currentUser?._id;
  const isOwnProfile = currentUser && profileId === currentUser._id;

  useEffect(() => {
    if (profileId) {
      fetchUserProfile();
      if (currentUser && !isOwnProfile) {
        fetchExchangeHistory();
      }
    }
  }, [profileId, currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      let userData;
      
      if (isOwnProfile) {
        // Si es el perfil propio, obtener datos actualizados
        const response = await api.get('/users/me');
        userData = response.data;
      } else {
        // Si es perfil de otro usuario
        const response = await api.get(`/users/${profileId}`);
        userData = response.data;
      }
      
      setProfileUser(userData);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('No se pudo cargar el perfil del usuario');
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeHistory = async () => {
    try {
      const response = await api.get('/exchanges/my-requests');
      const relatedExchanges = response.data.filter(exchange => 
        (exchange.sender._id === profileId || exchange.recipient._id === profileId) &&
        (exchange.sender._id === currentUser._id || exchange.recipient._id === currentUser._id)
      );
      setExchanges(relatedExchanges);
    } catch (err) {
      console.error('Error fetching exchange history:', err);
    }
  };

  const handleSendRequest = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setShowExchangeModal(true);
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleProfileUpdated = (updatedUser) => {
    setProfileUser(updatedUser);
    setShowEditModal(false);
    // Actualizar también el contexto si es el perfil propio
    if (isOwnProfile && updateUser) {
      updateUser(updatedUser);
    }
  };

  const getExchangeStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'bg-warning text-dark', text: 'Pendiente', icon: 'fas fa-clock' },
      'accepted': { class: 'bg-success', text: 'Aceptado', icon: 'fas fa-check' },
      'rejected': { class: 'bg-danger', text: 'Rechazado', icon: 'fas fa-times' },
      'completed': { class: 'bg-info', text: 'Completado', icon: 'fas fa-check-circle' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: status, icon: 'fas fa-question' };
    return (
      <span className={`badge ${config.class} d-inline-flex align-items-center`}>
        <i className={`${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderAvatar = () => {
    if (profileUser.avatar) {
      return (
        <img
          src={profileUser.avatar}
          alt={`Avatar de ${profileUser.name}`}
          className="rounded-circle object-fit-cover"
          style={{ width: '120px', height: '120px' }}
          onError={(e) => {
            // Si la imagen falla al cargar, mostrar avatar con inicial
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    
    return (
      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
           style={{ width: '120px', height: '120px', fontSize: '3rem', fontWeight: 'bold' }}>
        {profileUser.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando perfil...</span>
          </div>
          <p className="text-muted">Cargando perfil de usuario...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-danger text-center" role="alert">
              <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
              <h4>Perfil no encontrado</h4>
              <p>{error || 'El usuario que buscas no existe o no tienes permisos para verlo.'}</p>
              <button className="btn btn-primary" onClick={() => navigate(isOwnProfile ? '/dashboard' : '/search')}>
                <i className="fas fa-arrow-left me-2"></i>
                {isOwnProfile ? 'Volver al Dashboard' : 'Volver a la búsqueda'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        <div className="row">
          {/* Información principal del perfil */}
          <div className="col-lg-8 mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                {/* Header del perfil */}
                <div className="row align-items-center mb-4">
                  <div className="col-auto text-center">
                    {renderAvatar()}
                    <div style={{ display: 'none' }} className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                         style={{ width: '120px', height: '120px', fontSize: '3rem', fontWeight: 'bold' }}>
                      {profileUser.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="col">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h1 className="h2 mb-2 text-dark fw-bold">
                          {profileUser.name}
                          {isOwnProfile && (
                            <span className="badge bg-primary ms-2 fs-6">Tu perfil</span>
                          )}
                        </h1>
                        <p className="text-muted mb-2">
                          <i className="fas fa-envelope me-2"></i>
                          {profileUser.email}
                        </p>
                        {profileUser.phone && (
                          <p className="text-muted mb-2">
                            <i className="fas fa-phone me-2"></i>
                            {profileUser.phone}
                          </p>
                        )}
                        {profileUser.location && (
                          <p className="text-muted mb-2">
                            <i className="fas fa-map-marker-alt me-2"></i>
                            {profileUser.location}
                          </p>
                        )}
                        {profileUser.bio && (
                          <div className="mt-3 p-3 bg-light rounded">
                            <h6 className="fw-bold mb-2">
                              <i className="fas fa-quote-left me-2 text-primary"></i>
                              Sobre mí
                            </h6>
                            <p className="text-secondary mb-0 fst-italic">
                              {profileUser.bio}
                            </p>
                          </div>
                        )}
                        <p className="text-muted small mt-3 mb-0">
                          <i className="fas fa-calendar me-2"></i>
                          Miembro desde {formatDate(profileUser.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                {(profileUser.experience || profileUser.interests || profileUser.languages) && (
                  <div className="row mb-4">
                    {profileUser.experience && (
                      <div className="col-md-4 mb-3">
                        <div className="border rounded p-3 h-100 bg-warning bg-opacity-10">
                          <h6 className="text-warning fw-bold mb-2">
                            <i className="fas fa-star me-2"></i>
                            Nivel de Experiencia
                          </h6>
                          <span className="badge bg-warning text-dark px-3 py-2">
                            {profileUser.experience}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {profileUser.languages && profileUser.languages.length > 0 && (
                      <div className="col-md-4 mb-3">
                        <div className="border rounded p-3 h-100 bg-primary bg-opacity-10">
                          <h6 className="text-primary fw-bold mb-2">
                            <i className="fas fa-language me-2"></i>
                            Idiomas
                          </h6>
                          <div className="d-flex flex-wrap gap-1">
                            {profileUser.languages.map((language, index) => (
                              <span key={index} className="badge bg-primary rounded-pill px-2 py-1">
                                {language}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {profileUser.interests && profileUser.interests.length > 0 && (
                      <div className="col-md-4 mb-3">
                        <div className="border rounded p-3 h-100 bg-secondary bg-opacity-10">
                          <h6 className="text-secondary fw-bold mb-2">
                            <i className="fas fa-heart me-2"></i>
                            Intereses
                          </h6>
                          <div className="d-flex flex-wrap gap-1">
                            {profileUser.interests.slice(0, 3).map((interest, index) => (
                              <span key={index} className="badge bg-secondary rounded-pill px-2 py-1">
                                {interest}
                              </span>
                            ))}
                            {profileUser.interests.length > 3 && (
                              <span className="badge bg-secondary rounded-pill px-2 py-1">
                                +{profileUser.interests.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Habilidades */}
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="border rounded p-3 h-100 bg-success bg-opacity-10">
                      <h5 className="text-success fw-bold mb-3">
                        <i className="fas fa-hand-holding me-2"></i>
                        Habilidades que ofrece
                      </h5>
                      {profileUser.skills_to_offer && profileUser.skills_to_offer.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {profileUser.skills_to_offer.map((skill, index) => (
                            <span key={index} className="badge bg-success rounded-pill px-3 py-2">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted fst-italic mb-0">
                          No ha especificado habilidades que ofrece
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-4">
                    <div className="border rounded p-3 h-100 bg-info bg-opacity-10">
                      <h5 className="text-info fw-bold mb-3">
                        <i className="fas fa-graduation-cap me-2"></i>
                        Quiere aprender
                      </h5>
                      {profileUser.skills_to_learn && profileUser.skills_to_learn.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {profileUser.skills_to_learn.map((skill, index) => (
                            <span key={index} className="badge bg-info rounded-pill px-3 py-2">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted fst-italic mb-0">
                          No ha especificado habilidades que quiere aprender
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar con acciones */}
          <div className="col-lg-4">
            {/* Acciones */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h6 className="card-title fw-bold mb-3">
                  <i className="fas fa-cog me-2"></i>
                  Acciones
                </h6>
                
                <div className="d-grid gap-2">
                  {isOwnProfile ? (
                    <>
                      <button 
                        className="btn btn-primary"
                        onClick={handleEditProfile}
                      >
                        <i className="fas fa-edit me-2"></i>
                        Editar Perfil
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/dashboard')}
                      >
                        <i className="fas fa-tachometer-alt me-2"></i>
                        Ir al Dashboard
                      </button>
                      <button 
                        className="btn btn-outline-info"
                        onClick={() => navigate('/search')}
                      >
                        <i className="fas fa-search me-2"></i>
                        Buscar Intercambios
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="btn btn-primary"
                        onClick={handleSendRequest}
                      >
                        <i className="fas fa-paper-plane me-2"></i>
                        Enviar Solicitud de Intercambio
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/search')}
                      >
                        <i className="fas fa-arrow-left me-2"></i>
                        Volver a la búsqueda
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Historial de intercambios (solo si hay y no es perfil propio) */}
            {exchanges.length > 0 && !isOwnProfile && (
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h6 className="card-title fw-bold mb-3">
                    <i className="fas fa-history me-2"></i>
                    Historial de Intercambios
                  </h6>
                  
                  <div className="list-group list-group-flush">
                    {exchanges.slice(0, 3).map((exchange) => {
                      const isReceived = exchange.recipient._id === currentUser._id;
                      return (
                        <div key={exchange._id} className="list-group-item px-0 py-2 border-0">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <small className="text-muted d-block">
                                {isReceived ? 'Recibida' : 'Enviada'} - {formatDate(exchange.date)}
                              </small>
                              <div className="mt-1">
                                {getExchangeStatusBadge(exchange.status)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {exchanges.length > 3 && (
                    <div className="text-center mt-2">
                      <small className="text-muted">
                        Y {exchanges.length - 3} intercambio{exchanges.length - 3 !== 1 ? 's' : ''} más...
                      </small>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showExchangeModal && (
        <ExchangeRequestModal
          onClose={() => setShowExchangeModal(false)}
          recipient={profileUser}
        />
      )}

      {showEditModal && (
        <EditProfileModal
          user={profileUser}
          onClose={() => setShowEditModal(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
};

export default ProfilePage;
