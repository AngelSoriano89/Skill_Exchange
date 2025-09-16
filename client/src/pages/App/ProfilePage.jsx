import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useContext(AuthContext);
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exchanges, setExchanges] = useState([]);

  const profileId = id || currentUser?._id;
  const isOwnProfile = currentUser && profileId === currentUser._id;

  useEffect(() => {
    if (profileId) {
      fetchUserProfile();
      if (currentUser && !isOwnProfile) {
        fetchExchangeHistory();
      }
    }
  }, [profileId, currentUser, isOwnProfile]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      let userData;
      
      if (isOwnProfile) {
        const response = await api.get('/users/me');
        userData = response.data;
      } else {
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

  // CORREGIDO: Navegar a una nueva página en lugar de mostrar modal
  const handleSendRequest = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    // Navegar a una nueva página de solicitud de intercambio
    navigate(`/exchange/request/${profileId}`);
  };

  const handleEditProfile = () => {
    // Navegar a la página de edición en lugar de abrir un modal
    navigate('/profile/edit');
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:5000${avatarPath}`;
  };

  const renderAvatarWithFallback = (userData, sizeClasses = 'w-32 h-32') => {
    if (!userData) return null;
    
    const avatarUrl = userData.avatar ? getAvatarUrl(userData.avatar) : null;
    
    return (
      <div className="relative">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={`Avatar de ${userData.name}`}
            className={`${sizeClasses} rounded-full object-cover border-4 border-white shadow-xl`}
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.parentNode.querySelector('.fallback-avatar');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        )}
        <div 
          className={`fallback-avatar ${sizeClasses} bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl ${avatarUrl ? 'hidden' : 'flex'}`}
        >
          {userData.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    );
  };

  const getExchangeStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'badge-warning', text: 'Pendiente', icon: 'fas fa-clock' },
      'accepted': { class: 'badge-success', text: 'Aceptado', icon: 'fas fa-check' },
      'rejected': { class: 'badge-danger', text: 'Rechazado', icon: 'fas fa-times' },
      'completed': { class: 'badge-info', text: 'Completado', icon: 'fas fa-check-circle' }
    };
    
    const config = statusConfig[status] || { class: 'bg-gray-100 text-gray-800', text: status, icon: 'fas fa-question' };
    return (
      <span className={`${config.class} inline-flex items-center`}>
        <i className={`${config.icon} mr-1`}></i>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando perfil de usuario...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Perfil no encontrado</h2>
            <p className="text-gray-600 mb-6">{error || 'El usuario que buscas no existe o no tienes permisos para verlo.'}</p>
            <button 
              className="btn-primary w-full"
              onClick={() => navigate(isOwnProfile ? '/dashboard' : '/search')}
            >
              <i className="fas fa-arrow-left mr-2"></i>
              {isOwnProfile ? 'Volver al Dashboard' : 'Volver a la búsqueda'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header del Perfil */}
              <div className="card p-8 animate-fade-in-up">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                  <div className="flex-shrink-0 text-center">
                    {renderAvatarWithFallback(profileUser)}
                    {isOwnProfile && (
                      <button
                        onClick={handleEditProfile}
                        className="mt-4 btn-outline-primary text-sm px-4 py-2"
                      >
                        <i className="fas fa-edit mr-2"></i>
                        Editar perfil
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-grow text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {profileUser.name}
                          {isOwnProfile && (
                            <span className="ml-3 badge-primary text-sm">Tu perfil</span>
                          )}
                        </h1>
                        <div className="space-y-1 text-gray-600">
                          <p className="flex items-center justify-center md:justify-start">
                            <i className="fas fa-envelope mr-2 text-primary-600"></i>
                            {profileUser.email}
                          </p>
                          {profileUser.phone && (
                            <p className="flex items-center justify-center md:justify-start">
                              <i className="fas fa-phone mr-2 text-green-600"></i>
                              {profileUser.phone}
                            </p>
                          )}
                          {profileUser.location && (
                            <p className="flex items-center justify-center md:justify-start">
                              <i className="fas fa-map-marker-alt mr-2 text-red-600"></i>
                              {profileUser.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {profileUser.bio && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                          <i className="fas fa-quote-left mr-2 text-primary-600"></i>
                          Sobre mí
                        </h3>
                        <p className="text-gray-700 italic leading-relaxed">{profileUser.bio}</p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <i className="fas fa-calendar mr-1"></i>
                        Miembro desde {formatDate(profileUser.date)}
                      </span>
                      {profileUser.experience && (
                        <span className="badge-warning">
                          <i className="fas fa-star mr-1"></i>
                          {profileUser.experience}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              {(profileUser.languages?.length > 0 || profileUser.interests?.length > 0) && (
                <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Información adicional</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profileUser.languages?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
                          <i className="fas fa-language mr-2"></i>
                          Idiomas
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {profileUser.languages.map((language, index) => (
                            <span key={index} className="badge-primary">
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {profileUser.interests?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-purple-700 mb-3 flex items-center">
                          <i className="fas fa-heart mr-2"></i>
                          Intereses
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {profileUser.interests.slice(0, 6).map((interest, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {interest}
                            </span>
                          ))}
                          {profileUser.interests.length > 6 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              +{profileUser.interests.length - 6} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Habilidades */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Habilidades que ofrece */}
                <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                    <i className="fas fa-hand-holding mr-2"></i>
                    Enseña
                  </h3>
                  {profileUser.skills_to_offer?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileUser.skills_to_offer.map((skill, index) => (
                        <span key={index} className="badge-success">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No ha especificado habilidades que ofrece</p>
                  )}
                </div>
                
                {/* Habilidades que quiere aprender */}
                <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                    <i className="fas fa-graduation-cap mr-2"></i>
                    Quiere aprender
                  </h3>
                  {profileUser.skills_to_learn?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileUser.skills_to_learn.map((skill, index) => (
                        <span key={index} className="badge-info">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No ha especificado habilidades que quiere aprender</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Acciones */}
              <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-cog mr-2"></i>
                  Acciones
                </h3>
                
                <div className="space-y-3">
                  {isOwnProfile ? (
                    <>
                      <button 
                        className="btn-primary w-full"
                        onClick={handleEditProfile}
                      >
                        <i className="fas fa-edit mr-2"></i>
                        Editar Perfil
                      </button>
                      <button 
                        className="btn-secondary w-full"
                        onClick={() => navigate('/dashboard')}
                      >
                        <i className="fas fa-tachometer-alt mr-2"></i>
                        Ir al Dashboard
                      </button>
                      <button 
                        className="btn-outline-primary w-full"
                        onClick={() => navigate('/search')}
                      >
                        <i className="fas fa-search mr-2"></i>
                        Buscar Intercambios
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="btn-primary w-full"
                        onClick={handleSendRequest}
                      >
                        <i className="fas fa-paper-plane mr-2"></i>
                        Enviar Solicitud
                      </button>
                      <button 
                        className="btn-outline-primary w-full"
                        onClick={() => navigate('/search')}
                      >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Volver a la búsqueda
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Historial de intercambios */}
              {exchanges.length > 0 && !isOwnProfile && (
                <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-history mr-2"></i>
                    Historial
                  </h3>
                  
                  <div className="space-y-3">
                    {exchanges.slice(0, 3).map((exchange) => {
                      const isReceived = exchange.recipient._id === currentUser._id;
                      return (
                        <div key={exchange._id} className="border-l-4 border-gray-200 pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-600">
                                {isReceived ? 'Recibida' : 'Enviada'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(exchange.date)}
                              </p>
                            </div>
                            {getExchangeStatusBadge(exchange.status)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {exchanges.length > 3 && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                      Y {exchanges.length - 3} intercambio{exchanges.length - 3 !== 1 ? 's' : ''} más...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
