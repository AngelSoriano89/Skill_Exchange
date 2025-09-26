import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api.jsx';
import { buildAvatarUrl } from '../../api/api';
import { AuthContext } from '../../context/AuthContext';

const UserContactPage = () => {
  const { exchangeId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const fetchExchangeDetails = useCallback(async () => {
    try {
      const res = await api.get(`/exchanges/${exchangeId}`);
      setExchange(res.data);
    } catch (err) {
      console.error('Error fetching exchange details:', err);
      setError('No se pudo cargar la información del intercambio.');
    } finally {
      setLoading(false);
    }
  }, [exchangeId]);

  useEffect(() => {
    if (user && exchangeId) {
      fetchExchangeDetails();
    }
  }, [exchangeId, user, fetchExchangeDetails]);

  const handleCompleteExchange = async () => {
    setCompleting(true);
    try {
      await api.put(`/exchanges/complete/${exchangeId}`);
      setShowCompleteModal(false);
      // Mostrar mensaje de éxito
      alert('¡Intercambio marcado como completado exitosamente! 🎉');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error completing exchange:', err);
      alert('Error al completar el intercambio. Intenta de nuevo.');
    } finally {
      setCompleting(false);
    }
  };

const renderAvatarWithFallback = (userData, sizeClasses = 'w-10 h-10') => {
  if (!userData) return null;
  
  const cacheKey = userData?.updatedAt || userData?.date || userData?._id || '';
  const avatarUrl = userData.avatar ? buildAvatarUrl(userData.avatar, cacheKey) : null;
  
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

  const handleSendEmail = (otherUser) => {
    const subject = encodeURIComponent('Intercambio de Habilidades - Skill Exchange');
    const body = encodeURIComponent(`¡Hola ${otherUser.name}!

Te contacto sobre nuestro intercambio de habilidades aceptado en Skill Exchange.

📚 Habilidades que me enseñarás: ${exchange.skills_to_learn.join(', ')}
🎯 Habilidades que te enseñaré: ${exchange.skills_to_offer.join(', ')}

Me gustaría coordinar nuestras sesiones de intercambio. ¿Cuál sería un buen momento para ti?

¡Estoy emocionado/a de comenzar este intercambio de conocimientos!

Saludos,
${user.name}`);

    const mailtoLink = `mailto:${otherUser.email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  const handleSendWhatsApp = (otherUser) => {
    if (!otherUser.phone) {
      alert('Este usuario no ha proporcionado un número de teléfono.');
      return;
    }

    // Limpiar el número de teléfono (quitar espacios, guiones, etc.)
    const cleanPhone = otherUser.phone.replace(/\D/g, '');
    
    const message = encodeURIComponent(`¡Hola ${otherUser.name}! 👋

Te contacto desde Skill Exchange sobre nuestro intercambio de habilidades aceptado.

📚 Me enseñarás: ${exchange.skills_to_learn.join(', ')}
🎯 Te enseñaré: ${exchange.skills_to_offer.join(', ')}

¿Cuándo podríamos comenzar con nuestras sesiones? 😊`);

    const whatsappLink = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappLink, '_blank');
  };

  const CompleteExchangeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check-circle text-green-600 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¿Completar Intercambio?
            </h3>
            <p className="text-gray-600">
              ¿Estás seguro de que han terminado exitosamente el intercambio de habilidades? 
              Esta acción no se puede deshacer.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowCompleteModal(false)}
              className="btn-outline-secondary flex-1"
              disabled={completing}
            >
              Cancelar
            </button>
            <button
              onClick={handleCompleteExchange}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex-1"
              disabled={completing}
            >
              {completing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Completando...
                </>
              ) : (
                <>
                  <i className="fas fa-check mr-2"></i>
                  Sí, Completar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
                <i className="fas fa-handshake text-white text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Intercambio Aceptado!</h1>
              <p className="text-gray-600 text-lg">
                Es hora de conectar y comenzar tu intercambio de habilidades
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
                
                <div className="space-y-2 mb-6">
                  {otherUser.phone && (
                    <div className="flex items-center justify-center text-gray-600">
                      <i className="fas fa-phone text-green-500 mr-2"></i>
                      <span className="text-sm">{otherUser.phone}</span>
                    </div>
                  )}
                  
                  {otherUser.location && (
                    <div className="flex items-center justify-center text-gray-600">
                      <i className="fas fa-map-marker-alt text-red-500 mr-2"></i>
                      <span className="text-sm">{otherUser.location}</span>
                    </div>
                  )}

                  {otherUser.experience && (
                    <div className="flex items-center justify-center">
                      <span className="badge-warning text-xs">
                        <i className="fas fa-star mr-1"></i>
                        {otherUser.experience}
                      </span>
                    </div>
                  )}
                </div>
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
                        <i className="fas fa-graduation-cap mr-2"></i>
                        Tú aprenderás:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {exchange.skills_to_learn.map((skill, index) => (
                          <span key={index} className="badge-success text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-semibold text-blue-700 mb-2">
                        <i className="fas fa-hand-holding mr-2"></i>
                        Tú enseñarás:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {exchange.skills_to_offer.map((skill, index) => (
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
                      <h4 className="font-bold text-gray-900 mb-2">¡Hora de conectar!</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Usa los botones de abajo para contactar con {otherUser.name} y coordinar vuestras sesiones de intercambio.
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>📧 <strong>Email:</strong> Para conversaciones detalladas y planificación</li>
                        <li>📱 <strong>WhatsApp:</strong> Para comunicación rápida y coordinación</li>
                        <li>✅ <strong>Completar:</strong> Cuando hayan terminado exitosamente el intercambio</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleSendEmail(otherUser)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <i className="fas fa-envelope text-lg mr-3"></i>
                      <div className="text-left">
                        <div className="font-semibold">Enviar Email</div>
                        <div className="text-xs opacity-75">Planificación detallada</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleSendWhatsApp(otherUser)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                      disabled={!otherUser.phone}
                    >
                      <i className="fab fa-whatsapp text-lg mr-3"></i>
                      <div className="text-left">
                        <div className="font-semibold">
                          {otherUser.phone ? 'Enviar WhatsApp' : 'Sin WhatsApp'}
                        </div>
                        <div className="text-xs opacity-75">
                          {otherUser.phone ? 'Comunicación rápida' : 'No disponible'}
                        </div>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowCompleteModal(true)}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <i className="fas fa-check-circle mr-2"></i>
                    Marcar Intercambio como Completado
                  </button>

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

      {/* Modal de confirmación para completar */}
      {showCompleteModal && <CompleteExchangeModal />}
    </div>
  );
};

export default UserContactPage;
