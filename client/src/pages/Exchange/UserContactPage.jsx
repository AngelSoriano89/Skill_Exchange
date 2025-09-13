import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';

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

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:5000${avatarPath}`;
  };

  const renderAvatar = (userData) => {
    if (!userData) return null;
    
    const avatarUrl = userData.avatar ? getAvatarUrl(userData.avatar) : null;
    
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={`Avatar de ${userData.name}`}
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          onError={(e) => {
            e.target.style.display = 'none';
            const fallback = e.target.nextElementSibling;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      );
    }
    
    return (
      <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
        {userData.name?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  const renderAvatarWithFallback = (userData) => {
    if (!userData) return null;
    
    const avatarUrl = userData.avatar ? getAvatarUrl(userData.avatar) : null;
    
    return (
      <div className="relative">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={`Avatar de ${userData.name}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.parentNode.querySelector('.fallback-avatar');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        )}
        <div 
          className={`fallback-avatar w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg ${avatarUrl ? 'hidden' : 'flex'}`}
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando detalles del intercambio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              className="btn-primary w-full"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!exchange) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <i className="fas fa-search text-gray-300 text-5xl mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Intercambio no encontrado</h2>
            <p className="text-gray-600 mb-6">El intercambio que buscas no existe o no tienes permisos para verlo.</p>
            <button 
              className="btn-primary w-full"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const otherUser = exchange.sender._id === user._id ? exchange.recipient : exchange.sender;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check-circle text-white text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Intercambio Aceptado!</h1>
              <p className="text-gray-600 text-lg">
                Ahora pueden contactarse directamente para coordinar su intercambio de habilidades.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User Info */}
              <div className="text-center">
                <div className="mb-4">
                  {renderAvatarWithFallback(otherUser)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{otherUser.name}</h3>
                <p className="text-gray-600 mb-4">{otherUser.email}</p>
                
                {otherUser.phone && (
                  <div className="flex items-center justify-center text-gray-600 mb-2">
                    <i className="fas fa-phone text-green-500 mr-2"></i>
                    <span>{otherUser.phone}</span>
                  </div>
                )}
                
                {otherUser.location && (
                  <div className="flex items-center justify-center text-gray-600">
                    <i className="fas fa-map-marker-alt text-red-500 mr-2"></i>
                    <span>{otherUser.location}</span>
                  </div>
                )}
              </div>

              {/* Exchange Details */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-exchange-alt text-primary-600 mr-2"></i>
                    Detalles del Intercambio
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-semibold text-green-700 mb-2">
                        <i className="fas fa-hand-holding mr-2"></i>
                        Habilidades ofrecidas:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {exchange.skills_to_offer.map((skill, index) => (
                          <span key={index} className="badge-success text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-semibold text-blue-700 mb-2">
                        <i className="fas fa-graduation-cap mr-2"></i>
                        Habilidades solicitadas:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {exchange.skills_to_learn.map((skill, index) => (
                          <span key={index} className="badge-info text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {exchange.message && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">
                        <i className="fas fa-comment mr-2"></i>
                        Mensaje inicial:
                      </h5>
                      <p className="text-gray-600 italic text-sm bg-white rounded p-3">
                        "{exchange.message}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Contact Actions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start">
                    <i className="fas fa-lightbulb text-yellow-500 text-xl mr-3 mt-1"></i>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Consejos para un intercambio exitoso:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Establezcan horarios y métodos de comunicación claros</li>
                        <li>• Definan objetivos específicos para cada sesión</li>
                        <li>• Sean pacientes y mantengan una actitud positiva</li>
                        <li>• Una vez completado, no olviden marcar el intercambio como finalizado</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href={`mailto:${otherUser.email}?subject=Intercambio de Habilidades - Skill Exchange&body=¡Hola ${otherUser.name}! Te contacto sobre nuestro intercambio de habilidades aceptado en Skill Exchange.%0A%0AHabilidades que ofreceré: ${exchange.skills_to_offer.join(', ')}%0AHabilidades que me enseñarás: ${exchange.skills_to_learn.join(', ')}%0A%0A¡Hablemos para coordinar nuestras sesiones!%0A%0ASaludos`}
                    className="btn-primary flex-1 text-center"
                  >
                    <i className="fas fa-envelope mr-2"></i>
                    Enviar Email
                  </a>
                  
                  {otherUser.phone && (
                    <a 
                      href={`https://wa.me/${otherUser.phone.replace(/\D/g, '')}?text=¡Hola ${otherUser.name}! Te contacto sobre nuestro intercambio de habilidades en Skill Exchange.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-success flex-1 text-center"
                    >
                      <i className="fab fa-whatsapp mr-2"></i>
                      WhatsApp
                    </a>
                  )}
                  
                  <button
                    onClick={handleCompleteExchange}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex-1"
                    disabled={completing}
                  >
                    {completing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                        Marcando como completado...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle mr-2"></i>
                        Marcar como Completado
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center mt-6">
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="btn-outline-secondary"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Volver al Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserContactPage;
