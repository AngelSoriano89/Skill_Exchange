import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // Agregado para navegación programática
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
      
      setPendingRequests(Array.isArray(pendingRes.data) ? pendingRes.data : []);
      setMyExchanges(Array.isArray(exchangesRes.data) ? exchangesRes.data : []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // En caso de error, también inicializa con arrays vacíos para evitar fallos.
      setPendingRequests([]);
      setMyExchanges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setActionLoading(true);
    try {
      await api.put(`/exchanges/accept/${requestId}`);
      await fetchDashboardData();
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
      await fetchDashboardData();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error al rechazar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  // Función para manejar contacto directo desde el dashboard
  const handleQuickContact = (exchange, contactType) => {
    const otherUser = exchange.sender._id === user._id ? exchange.recipient : exchange.sender;
    
    if (contactType === 'email') {
      const subject = encodeURIComponent('Intercambio de Habilidades - Skill Exchange');
      const body = encodeURIComponent(`¡Hola ${otherUser.name}!

Te contacto sobre nuestro intercambio de habilidades aceptado.

📚 Habilidades que me enseñarás: ${exchange.skills_to_learn.join(', ')}
🎯 Habilidades que te enseñaré: ${exchange.skills_to_offer.join(', ')}

¿Cuándo podríamos empezar con nuestras sesiones?

Saludos,
${user.name}`);

      window.location.href = `mailto:${otherUser.email}?subject=${subject}&body=${body}`;
    } else if (contactType === 'whatsapp') {
      if (!otherUser.phone) {
        alert('Este usuario no ha proporcionado un número de teléfono.');
        return;
      }
      
      const cleanPhone = otherUser.phone.replace(/\D/g, '');
      const message = encodeURIComponent(`¡Hola ${otherUser.name}! 👋

Sobre nuestro intercambio en Skill Exchange:
📚 Me enseñarás: ${exchange.skills_to_learn.join(', ')}
🎯 Te enseñaré: ${exchange.skills_to_offer.join(', ')}

¿Cuándo podemos comenzar? 😊`);

      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    }
  };

  // Función para navegar al perfil (CORREGIDA)
  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium',
      'accepted': 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium',
      'rejected': 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium',
      'completed': 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium'
    };
    
    const className = statusMap[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
    const text = status === 'pending' ? 'Pendiente' : 
                 status === 'accepted' ? 'Aceptado' : 
                 status === 'rejected' ? 'Rechazado' : 
                 status === 'completed' ? 'Completado' : status;
    
    return <span className={className}>{text}</span>;
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

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:5000${avatarPath}`;
  };

  const renderAvatarWithFallback = (userData, sizeClasses = 'w-10 h-10') => {
    if (!userData) return null;
    
    const avatarUrl = userData.avatar ? getAvatarUrl(userData.avatar) : null;
    
    return (
      <div className="relative">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={`Avatar de ${userData.name}`}
            className={`${sizeClasses} rounded-full object-cover border-2 border-white shadow-md`}
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.parentNode.querySelector('.fallback-avatar');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        )}
        <div 
          className={`fallback-avatar ${sizeClasses} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md ${avatarUrl ? 'hidden' : 'flex'}`}
        >
          {userData.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const acceptedExchanges = myExchanges.filter(ex => ex.status === 'accepted');
  const completedExchanges = myExchanges.filter(ex => ex.status === 'completed');
  const sentRequests = myExchanges.filter(ex => ex.sender._id === user._id && ex.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header del Dashboard */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                ¡Bienvenido de vuelta, 
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> {user?.name?.split(' ')[0]}</span>! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Aquí tienes un resumen de tu actividad reciente en Skill Exchange
              </p>
            </div>
          </div>
        </div>

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-500 to-pink-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold">{pendingRequests.length}</h3>
                <p className="text-red-100 font-medium">Solicitudes Pendientes</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <i className="fas fa-inbox text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold">{acceptedExchanges.length}</h3>
                <p className="text-green-100 font-medium">Intercambios Activos</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <i className="fas fa-handshake text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold">{completedExchanges.length}</h3>
                <p className="text-blue-100 font-medium">Completados</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <i className="fas fa-check-circle text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold">{sentRequests.length}</h3>
                <p className="text-yellow-100 font-medium">Enviadas</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <i className="fas fa-paper-plane text-2xl"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Solicitudes Recibidas - CORREGIDAS */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <i className="fas fa-inbox text-blue-600 mr-3"></i>
                Solicitudes Recibidas ({pendingRequests.length})
              </h2>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-inbox text-gray-300 text-5xl mb-4"></i>
                  <h3 className="text-lg font-semibold text-gray-500 mb-2">No tienes solicitudes pendientes</h3>
                  <p className="text-gray-400 text-sm">Las nuevas solicitudes aparecerán aquí</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {renderAvatarWithFallback(request.sender)}
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{request.sender.name}</h4>
                            <span className="text-xs text-gray-500">{formatDate(request.date)}</span>
                          </div>
                          
                          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{request.message}</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                            <div>
                              <p className="text-xs font-medium text-green-700 mb-1">Ofrece:</p>
                              <div className="flex flex-wrap gap-1">
                                {request.skills_to_offer.slice(0, 2).map((skill, index) => (
                                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">{skill}</span>
                                ))}
                                {request.skills_to_offer.length > 2 && (
                                  <span className="text-xs text-gray-500">+{request.skills_to_offer.length - 2}</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-blue-700 mb-1">Quiere:</p>
                              <div className="flex flex-wrap gap-1">
                                {request.skills_to_learn.slice(0, 2).map((skill, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{skill}</span>
                                ))}
                                {request.skills_to_learn.length > 2 && (
                                  <span className="text-xs text-gray-500">+{request.skills_to_learn.length - 2}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {/* CORREGIDO: Usar navigate en lugar de target="_blank" */}
                            
                            <button 
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                              onClick={() => setSelectedRequest(request)}
                            >
                              Ver detalles completos →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mis Intercambios - MEJORADO */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <i className="fas fa-exchange-alt text-green-600 mr-3"></i>
                Mis Intercambios
              </h2>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {myExchanges.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-handshake text-gray-300 text-5xl mb-4"></i>
                  <h3 className="text-lg font-semibold text-gray-500 mb-2">No tienes intercambios aún</h3>
                  <p className="text-gray-400 text-sm mb-4">¡Comienza buscando personas increíbles!</p>
                  <Link 
                    to="/search" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center"
                  >
                    <i className="fas fa-search mr-2"></i>
                    Buscar personas
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myExchanges.slice(0, 5).map((exchange) => {
                    const isReceived = exchange.recipient._id === user._id;
                    const otherUser = isReceived ? exchange.sender : exchange.recipient;
                    
                    return (
                      <div key={exchange._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {renderAvatarWithFallback(otherUser)}
                          </div>
                          
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {isReceived ? 'Solicitud de' : 'Enviado a'} {otherUser.name}
                              </h4>
                              {getStatusBadge(exchange.status)}
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Ofrece:</span> {exchange.skills_to_offer.join(', ')}
                            </div>
                            <div className="text-sm text-gray-600 mb-3">
                              <span className="font-medium">Quiere:</span> {exchange.skills_to_learn.join(', ')}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{formatDate(exchange.date)}</span>
                              
                              {/* Botones de contacto mejorados */}
                              {exchange.status === 'accepted' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleQuickContact(exchange, 'email')}
                                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors flex items-center"
                                    title="Enviar Email"
                                  >
                                    <i className="fas fa-envelope mr-1"></i>
                                    Email
                                  </button>
                                  
                                  {otherUser.phone && (
                                    <button
                                      onClick={() => handleQuickContact(exchange, 'whatsapp')}
                                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-full hover:bg-green-700 transition-colors flex items-center"
                                      title="Enviar WhatsApp"
                                    >
                                      <i className="fab fa-whatsapp mr-1"></i>
                                      WhatsApp
                                    </button>
                                  )}
                                  
                                  <Link 
                                    to={`/exchange/${exchange._id}/contact`}
                                    className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-full hover:bg-purple-700 transition-colors flex items-center"
                                    title="Ver detalles completos"
                                  >
                                    <i className="fas fa-info-circle mr-1"></i>
                                    Detalles
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {myExchanges.length > 5 && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        Y {myExchanges.length - 5} intercambio{myExchanges.length - 5 !== 1 ? 's' : ''} más...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para ver solicitud completa */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-100 bg-blue-50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <i className="fas fa-user-circle text-blue-600 mr-2"></i>
                  Solicitud de {selectedRequest.sender.name}
                </h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setSelectedRequest(null)}
                  disabled={actionLoading}
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
                      <i className="fas fa-comment mr-2"></i>
                      Mensaje
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">{selectedRequest.message}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                        <i className="fas fa-hand-holding mr-2"></i>
                        Ofrece
                      </h4>
                      <div className="space-y-2">
                        {selectedRequest.skills_to_offer.map((skill, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium block w-fit">{skill}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
                        <i className="fas fa-graduation-cap mr-2"></i>
                        Quiere aprender
                      </h4>
                      <div className="space-y-2">
                        {selectedRequest.skills_to_learn.map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium block w-fit">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="mb-4">
                    {renderAvatarWithFallback(selectedRequest.sender, 'w-20 h-20')}
                  </div>
                  <h5 className="font-bold text-gray-900 mb-2">{selectedRequest.sender.name}</h5>
                  <p className="text-gray-600 text-sm mb-4">{selectedRequest.sender.email}</p>
                                    
                  <div className="text-xs text-gray-500">
                    <i className="fas fa-clock mr-1"></i>
                    {formatDate(selectedRequest.date)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex-1"
                  onClick={() => handleAcceptRequest(selectedRequest._id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Aceptar Intercambio
                    </>
                  )}
                </button>
                <button 
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex-1"
                  onClick={() => handleRejectRequest(selectedRequest._id)}
                  disabled={actionLoading}
                >
                  <i className="fas fa-times mr-2"></i>
                  Rechazar
                </button>
                <button 
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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
