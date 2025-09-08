import React, { useState, useContext } from 'react';
import { FaStar, FaMapMarkerAlt, FaClock, FaDesktop, FaExchangeAlt, FaEye } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import ExchangeRequestModal from '../Exchange/ExchangeRequestModal';

const SkillCard = ({ skill }) => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);

  const isOwnSkill = user && skill.user._id === user._id;

  const formatTimeCommitment = (time) => {
    return time || 'Flexible';
  };

  const formatLocation = (location) => {
    if (location && (location.city || location.country)) {
      const parts = [location.city, location.country].filter(Boolean);
      return parts.join(', ');
    }
    return 'Ubicación no especificada';
  };

  return (
    <>
      <div className="card h-100 shadow-sm border-0 skill-card">
        <div className="card-body p-3">
          {/* Header con usuario */}
          <div className="d-flex align-items-center mb-3">
            {skill.user.avatar ? (
              <img
                src={skill.user.avatar}
                alt={skill.user.name}
                className="rounded-circle me-2"
                width="32"
                height="32"
              />
            ) : (
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                {skill.user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-grow-1">
              <h6 className="mb-0 fw-semibold">{skill.user.name}</h6>
              {skill.user.averageRating > 0 && (
                <div className="d-flex align-items-center">
                  <FaStar className="text-warning me-1" size={12} />
                  <small className="text-muted">{skill.user.averageRating.toFixed(1)}</small>
                </div>
              )}
            </div>
            <span className={`badge ${skill.isActive ? 'bg-success' : 'bg-secondary'}`}>
              {skill.isActive ? 'Disponible' : 'No disponible'}
            </span>
          </div>

          {/* Título y descripción */}
          <h5 className="card-title fw-bold mb-2" style={{ fontSize: '1.1rem' }}>
            {skill.title}
          </h5>
          <p className="card-text text-muted small mb-3" style={{ minHeight: '60px' }}>
            {skill.description.length > 100 
              ? `${skill.description.substring(0, 100)}...` 
              : skill.description}
          </p>

          {/* Categoría y nivel */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="badge bg-primary">{skill.category}</span>
            <span className="badge bg-info">{skill.level}</span>
          </div>

          {/* Tags */}
          {skill.tags && skill.tags.length > 0 && (
            <div className="mb-3">
              {skill.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="badge bg-light text-dark border me-1 mb-1">
                  {tag}
                </span>
              ))}
              {skill.tags.length > 3 && (
                <span className="badge bg-light text-dark border">
                  +{skill.tags.length - 3} más
                </span>
              )}
            </div>
          )}

          {/* Información adicional */}
          <div className="small text-muted mb-3">
            <div className="d-flex align-items-center mb-1">
              <FaClock className="me-2" size={12} />
              {formatTimeCommitment(skill.timeCommitment)}
            </div>
            <div className="d-flex align-items-center mb-1">
              <FaDesktop className="me-2" size={12} />
              {skill.preferredFormat}
            </div>
            <div className="d-flex align-items-center">
              <FaMapMarkerAlt className="me-2" size={12} />
              {formatLocation(skill.location)}
            </div>
          </div>

          {/* Rating de la habilidad */}
          {skill.averageRating > 0 && (
            <div className="d-flex align-items-center mb-3">
              <div className="me-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={star <= skill.averageRating ? 'text-warning' : 'text-muted'}
                    size={14}
                  />
                ))}
              </div>
              <small className="text-muted">
                ({skill.totalRatings} valoración{skill.totalRatings !== 1 ? 'es' : ''})
              </small>
            </div>
          )}
        </div>

        {/* Footer con botones de acción */}
        <div className="card-footer bg-white border-top-0 pt-0">
          <div className="d-flex gap-2">
            <Link
              to={`/skills/${skill._id}`}
              className="btn btn-outline-primary btn-sm flex-fill"
            >
              <FaEye className="me-1" size={12} />
              Ver detalles
            </Link>
            {!isOwnSkill && skill.isActive && (
              <button
                className="btn btn-primary btn-sm flex-fill"
                onClick={() => setShowModal(true)}
              >
                <FaExchangeAlt className="me-1" size={12} />
                Intercambiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal para solicitud de intercambio */}
      {showModal && (
        <ExchangeRequestModal
          recipientId={skill.user._id}
          recipientName={skill.user.name}
          skillTitle={skill.title}
          onClose={() => setShowModal(false)}
        />
      )}

      <style jsx>{`
        .skill-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .skill-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </>
  );
};

export default SkillCard;
