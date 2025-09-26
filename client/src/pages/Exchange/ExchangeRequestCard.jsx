import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api.jsx';
import { buildAvatarUrl } from '../../api/api';

const ExchangeRequestCard = ({ request, onUpdate }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/exchanges/accept/${request._id}`);
      onUpdate();
    } catch (err) {
      console.error("Error al aceptar la solicitud:", err);
      setError("No se pudo aceptar la solicitud. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/exchanges/reject/${request._id}`);
      onUpdate();
    } catch (err) {
      console.error("Error al rechazar la solicitud:", err);
      setError("No se pudo rechazar la solicitud. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Construcción de URL de avatar con cache-busting
  const getAvatarUrl = (avatarPath, userObj) => {
    const cacheKey = userObj?.updatedAt || userObj?.date || userObj?._id || '';
    return buildAvatarUrl(avatarPath, cacheKey);
  };

  const renderAvatar = () => {
    const avatarUrl = request.requester?.avatar ? getAvatarUrl(request.requester.avatar, request.requester) : null;
    
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
          onError={(e) => {
            e.target.style.display = 'none';
            const fallback = e.target.nextElementSibling;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      );
    }
    
    return (
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
        {request.requester.name?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full flex flex-col">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {error}
        </div>
      )}
      
      <div className="flex items-center mb-4">
        <div className="mr-3">
          {renderAvatar()}
        </div>
        <div>
          <h5 className="text-lg font-bold text-gray-900 mb-1">{request.requester.name}</h5>
          <p className="text-gray-500 text-sm">Solicitud de intercambio</p>
        </div>
      </div>
      
      <div className="flex-grow space-y-3">
        <div>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold text-green-600">Ofrece:</span>
          </p>
          <div className="flex flex-wrap gap-1">
            {request.skills_to_offer.map((skill, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold text-blue-600">Quiere aprender:</span>
          </p>
          <div className="flex flex-wrap gap-1">
            {request.skills_to_learn.map((skill, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        {request.message && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 italic">"{request.message}"</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
          onClick={handleAccept}
          disabled={loading}
        >
          <i className="fas fa-check-circle mr-1"></i>
          Aceptar
        </button>
        
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
          onClick={handleReject}
          disabled={loading}
        >
          <i className="fas fa-times-circle mr-1"></i>
          Rechazar
        </button>
        
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          onClick={() => navigate(`/profile/${request.requester._id}`)}
          disabled={loading}
        >
          Ver Perfil
        </button>
      </div>
    </div>
  );
};

export default ExchangeRequestCard;
