import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaClock, 
  FaVideo, 
  FaUsers, 
  FaUser, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaTag,
  FaGraduationCap
} from 'react-icons/fa';

const SkillGridCard = ({ 
  skill, 
  onEdit, 
  onDelete, 
  showActions = false, 
  className = "" 
}) => {
  const {
    _id,
    title,
    description,
    category,
    level,
    tags,
    location,
    timeCommitment,
    format,
    image,
    averageRating = 0,
    totalRatings = 0,
    isActive = true,
    owner
  } = skill;

  // Placeholder image URL if no image is provided
  const defaultImage = '/api/placeholder/300/200';
  const skillImage = image ? `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/uploads/skills/${image}` : defaultImage;

  // Format level display
  const getLevelBadge = (level) => {
    const levels = {
      'beginner': { label: 'Principiante', class: 'bg-success' },
      'intermediate': { label: 'Intermedio', class: 'bg-warning text-dark' },
      'advanced': { label: 'Avanzado', class: 'bg-danger' },
      'expert': { label: 'Experto', class: 'bg-dark' }
    };
    return levels[level] || { label: level, class: 'bg-secondary' };
  };

  // Format display
  const getFormatIcon = (format) => {
    switch (format) {
      case 'online':
        return <FaVideo className="me-1" size={12} />;
      case 'presencial':
        return <FaUsers className="me-1" size={12} />;
      case 'hibrido':
        return <><FaVideo className="me-1" size={10} /><FaUsers className="me-1" size={10} /></>;
      default:
        return <FaUser className="me-1" size={12} />;
    }
  };

  const levelInfo = getLevelBadge(level);

  return (
    <div className={`card border-0 shadow-sm h-100 skill-card ${className}`} style={{ transition: 'all 0.3s ease' }}>
      {/* Image Header */}
      <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
        <img
          src={skillImage}
          alt={title}
          className="card-img-top h-100 w-100"
          style={{ objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200/e9ecef/6c757d?text=Sin+Imagen';
          }}
        />
        
        {/* Overlay with status */}
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-start justify-content-between p-3">
          <span className={`badge rounded-pill ${isActive ? 'bg-success' : 'bg-secondary'}`}>
            {isActive ? 'Disponible' : 'No disponible'}
          </span>
          
          {averageRating > 0 && (
            <div className="badge bg-warning text-dark d-flex align-items-center">
              <FaStar size={10} className="me-1" />
              {averageRating.toFixed(1)} ({totalRatings})
            </div>
          )}
        </div>
      </div>

      <div className="card-body d-flex flex-column">
        {/* Title and Category */}
        <div className="mb-3">
          <div className="d-flex align-items-start justify-content-between mb-2">
            <h5 className="card-title fw-bold mb-1 text-truncate" style={{ fontSize: '1.1rem' }}>
              {title}
            </h5>
            <span className={`badge ${levelInfo.class} ms-2`} style={{ fontSize: '0.7rem' }}>
              <FaGraduationCap className="me-1" size={10} />
              {levelInfo.label}
            </span>
          </div>
          
          <div className="d-flex align-items-center mb-2">
            <span className="badge bg-primary me-2" style={{ fontSize: '0.75rem' }}>
              {category}
            </span>
            <span className={`badge ${levelInfo.class}`} style={{ fontSize: '0.7rem' }}>
              {levelInfo.label}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="card-text text-muted small mb-3 flex-grow-1" style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.4',
          minHeight: '2.8em'
        }}>
          {description}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mb-3">
            <div className="d-flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="badge bg-light text-dark border" style={{ fontSize: '0.65rem' }}>
                  <FaTag size={8} className="me-1" />
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="badge bg-light text-muted border" style={{ fontSize: '0.65rem' }}>
                  +{tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="mb-3">
          <div className="row g-2">
            {location && (
              <div className="col-12">
                <small className="text-muted d-flex align-items-center">
                  <FaMapMarkerAlt className="me-1 text-danger" size={12} />
                  {location}
                </small>
              </div>
            )}
            
            {timeCommitment && (
              <div className="col-12">
                <small className="text-muted d-flex align-items-center">
                  <FaClock className="me-1 text-warning" size={12} />
                  {timeCommitment}
                </small>
              </div>
            )}
            
            {format && (
              <div className="col-12">
                <small className="text-muted d-flex align-items-center text-capitalize">
                  {getFormatIcon(format)}
                  {format}
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto">
          {showActions ? (
            // Owner actions
            <div className="d-flex gap-2">
              <Link
                to={`/skills/${_id}`}
                className="btn btn-outline-primary btn-sm flex-fill"
                title="Ver detalle"
              >
                <FaEye size={12} />
              </Link>
              
              <button
                onClick={() => onEdit && onEdit(skill)}
                className="btn btn-outline-secondary btn-sm flex-fill"
                title="Editar"
              >
                <FaEdit size={12} />
              </button>
              
              <button
                onClick={() => onDelete && onDelete(skill)}
                className="btn btn-outline-danger btn-sm flex-fill"
                title="Eliminar"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ) : (
            // View action for others
            <Link
              to={`/skills/${_id}`}
              className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center"
            >
              <FaEye className="me-2" size={12} />
              Ver Detalle
            </Link>
          )}
        </div>
      </div>

      {/* Custom hover effects */}
      <style jsx>{`
        .skill-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        
        .skill-card:hover .card-img-top {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default SkillGridCard;
