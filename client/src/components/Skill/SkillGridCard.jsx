import React, { useState } from 'react';
import { FaStar, FaMapMarkerAlt, FaClock, FaDesktop, FaEdit, FaEye, FaTrash, FaImage } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { showDeleteConfirmAlert } from '../../utils/sweetAlert';
import skillService from '../../services/skillService';

const SkillGridCard = ({ skill, onUpdate, showActions = false }) => {
  const [imageError, setImageError] = useState(false);

  const handleDelete = async () => {
    const result = await showDeleteConfirmAlert(skill.title);
    if (result.isConfirmed) {
      try {
        await skillService.deleteSkill(skill._id);
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error eliminando habilidad:', error);
      }
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${imagePath}`;
  };

  const formatTimeCommitment = (time) => {
    return time || 'Flexible';
  };

  const formatLocation = (location) => {
    if (location && (location.city || location.country)) {
      const parts = [location.city, location.country].filter(Boolean);
      return parts.join(', ');
    }
    return 'Ubicación flexible';
  };

  return (
    <div className="skill-grid-card">
      <div className="card h-100 shadow-sm border-0 overflow-hidden">
        {/* Imagen de la habilidad */}
        <div className="skill-image-container position-relative">
          {skill.images && skill.images.length > 0 && !imageError ? (
            <img
              src={getImageUrl(skill.images[0])}
              alt={skill.title}
              className="card-img-top skill-image"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="skill-placeholder d-flex align-items-center justify-content-center">
              <FaImage className="text-muted" size={40} />
            </div>
          )}
          
          {/* Badge de estado */}
          <div className="position-absolute top-0 end-0 m-2">
            <span className={`badge ${skill.isActive ? 'bg-success' : 'bg-secondary'} shadow-sm`}>
              {skill.isActive ? 'Disponible' : 'No disponible'}
            </span>
          </div>
        </div>

        <div className="card-body p-3 d-flex flex-column">
          {/* Categoría y nivel */}
          <div className="d-flex justify-content-between mb-2">
            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
              {skill.category}
            </span>
            <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25">
              {skill.level}
            </span>
          </div>

          {/* Título */}
          <h6 className="card-title fw-bold mb-2 text-truncate" title={skill.title}>
            {skill.title}
          </h6>

          {/* Descripción */}
          <p className="card-text text-muted small mb-3 flex-grow-1" style={{ minHeight: '60px' }}>
            {skill.description.length > 100 
              ? `${skill.description.substring(0, 100)}...` 
              : skill.description}
          </p>

          {/* Tags */}
          {skill.tags && skill.tags.length > 0 && (
            <div className="mb-3">
              {skill.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="badge bg-light text-dark border me-1 mb-1 small">
                  #{tag}
                </span>
              ))}
              {skill.tags.length > 2 && (
                <span className="badge bg-light text-dark border small">
                  +{skill.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Información adicional */}
          <div className="skill-info mb-3">
            <div className="d-flex align-items-center mb-1 small text-muted">
              <FaClock className="me-2" size={12} />
              {formatTimeCommitment(skill.timeCommitment)}
            </div>
            <div className="d-flex align-items-center mb-1 small text-muted">
              <FaDesktop className="me-2" size={12} />
              {skill.preferredFormat}
            </div>
            <div className="d-flex align-items-center small text-muted">
              <FaMapMarkerAlt className="me-2" size={12} />
              {formatLocation(skill.location)}
            </div>
          </div>

          {/* Rating */}
          {skill.averageRating > 0 && (
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={star <= skill.averageRating ? 'text-warning' : 'text-muted'}
                    size={12}
                  />
                ))}
              </div>
              <small className="text-muted">
                ({skill.totalRatings})
              </small>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="card-footer bg-white border-0 pt-0">
          {showActions ? (
            <div className="d-flex gap-1">
              <Link
                to={`/skills/${skill._id}`}
                className="btn btn-outline-primary btn-sm flex-fill"
                title="Ver detalles"
              >
                <FaEye size={12} />
              </Link>
              <Link
                to={`/skills/edit/${skill._id}`}
                className="btn btn-outline-warning btn-sm flex-fill"
                title="Editar"
              >
                <FaEdit size={12} />
              </Link>
              <button
                onClick={handleDelete}
                className="btn btn-outline-danger btn-sm flex-fill"
                title="Eliminar"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ) : (
            <Link
              to={`/skills/${skill._id}`}
              className="btn btn-outline-primary btn-sm w-100"
            >
              <FaEye className="me-1" size={12} />
              Ver detalles
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .skill-grid-card .card {
          transition: all 0.3s ease;
        }
        
        .skill-grid-card .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }
        
        .skill-image-container {
          height: 180px;
          overflow: hidden;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        .skill-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .skill-grid-card .card:hover .skill-image {
          transform: scale(1.05);
        }
        
        .skill-placeholder {
          height: 100%;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        .skill-info {
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default SkillGridCard;
