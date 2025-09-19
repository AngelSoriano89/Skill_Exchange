import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api';

const ExchangeRequestPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    message: '',
    skills_to_offer: '',
    skills_to_learn: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (userId) {
      fetchRecipientData();
    }
  }, [userId, user, navigate]);

  const fetchRecipientData = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setRecipient(response.data);
      
      // Pre-llenar habilidades basadas en los perfiles
      if (user.skills_to_offer) {
        setFormData(prev => ({
          ...prev,
          skills_to_offer: user.skills_to_offer.join(', ')
        }));
      }
      
      if (response.data.skills_to_offer) {
        setFormData(prev => ({
          ...prev,
          skills_to_learn: response.data.skills_to_offer.slice(0, 3).join(', ')
        }));
      }
      
    } catch (err) {
      console.error('Error fetching recipient data:', err);
      setError('No se pudo cargar la información del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error cuando el usuario escriba
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.message.trim()) {
      setError('Por favor escribe un mensaje personalizado');
      return false;
    }
    if (!formData.skills_to_offer.trim()) {
      setError('Especifica qué habilidades puedes ofrecer');
      return false;
    }
    if (!formData.skills_to_learn.trim()) {
      setError('Especifica qué habilidades quieres aprender');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const requestData = {
        recipientId: recipient._id,
        skills_to_offer: formData.skills_to_offer.split(',').map(s => s.trim()).filter(s => s),
        skills_to_learn: formData.skills_to_learn.split(',').map(s => s.trim()).filter(s => s),
        message: formData.message.trim(),
      };

      await api.post('/exchanges/request', requestData);
      setSuccess(true);
    } catch (err) {
      console.error('Error sending exchange request:', err);
      setError(err.response?.data?.msg || 'Error al enviar la solicitud. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:5000${avatarPath}`;
  };

  const renderAvatarWithFallback = (userData, sizeClasses = 'w-20 h-20') => {
    if (!userData) return null;
    
    const avatarUrl = userData.avatar ? getAvatarUrl(userData.avatar) : null;
    
    return (
      <div className="relative">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={`Avatar de ${userData.name}`}
            className={`${sizeClasses} rounded-full object-cover border-4 border-white shadow-lg`}
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.parentNode.querySelector('.fallback-avatar');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        )}
        <div 
          className={`fallback-avatar ${sizeClasses} bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-lg ${avatarUrl ? 'hidden' : 'flex'}`}
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
          <p className="text-gray-600 font-medium">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <i className="fas fa-sign-in-alt text-blue-500 text-5xl mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Inicia Sesión</h2>
            <p className="text-gray-600 mb-6">Debes iniciar sesión para enviar solicitudes de intercambio</p>
            <button 
              className="btn-primary w-full"
              onClick={() => navigate('/login')}
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error && !recipient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              className="btn-primary w-full"
              onClick={() => navigate('/search')}
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Volver a la búsqueda
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-check-circle text-green-600 text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Solicitud Enviada!</h2>
            <p className="text-gray-600 mb-6">
              Tu solicitud de intercambio ha sido enviada a <strong>{recipient.name}</strong>. 
              Te notificaremos cuando respondan.
            </p>
            <div className="space-y-3">
              <button 
                className="btn-primary w-full"
                onClick={() => navigate('/dashboard')}
              >
                <i className="fas fa-tachometer-alt mr-2"></i>
                Ir al Dashboard
              </button>
              <button 
                className="btn-outline-secondary w-full"
                onClick={() => navigate('/search')}
              >
                <i className="fas fa-search mr-2"></i>
                Continuar Buscando
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <i className="fas fa-paper-plane text-primary-600 mr-2"></i>
                Solicitar Intercambio
              </h1>
              <p className="text-gray-600">Envía una solicitud personalizada para intercambiar habilidades</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Información del destinatario */}
              <div className="text-center">
                {renderAvatarWithFallback(recipient)}
                <h2 className="text-2xl font-bold text-gray-900 mt-4">{recipient.name}</h2>
                <p className="text-gray-600">{recipient.email}</p>
                
                {recipient.skills_to_offer && recipient.skills_to_offer.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Habilidades disponibles:</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {recipient.skills_to_offer.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Formulario de solicitud */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      <i className="fas fa-exclamation-circle mr-2"></i>
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="fas fa-comment mr-2"></i>
                      Mensaje personalizado
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Escribe un mensaje personalizado explicando por qué te interesa este intercambio..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="skills_to_offer" className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="fas fa-gift mr-2"></i>
                      Habilidades que puedes ofrecer
                    </label>
                    <input
                      type="text"
                      id="skills_to_offer"
                      name="skills_to_offer"
                      value={formData.skills_to_offer}
                      onChange={handleChange}
                      placeholder="Ej: JavaScript, React, Node.js"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Separa las habilidades con comas</p>
                  </div>

                  <div>
                    <label htmlFor="skills_to_learn" className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="fas fa-graduation-cap mr-2"></i>
                      Habilidades que quieres aprender
                    </label>
                    <input
                      type="text"
                      id="skills_to_learn"
                      name="skills_to_learn"
                      value={formData.skills_to_learn}
                      onChange={handleChange}
                      placeholder="Ej: Python, Machine Learning, Data Science"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Separa las habilidades con comas</p>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane mr-2"></i>
                          Enviar Solicitud
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRequestPage;
