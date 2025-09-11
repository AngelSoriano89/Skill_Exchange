import React from 'react';
import { Link } from 'react-router-dom';

const UserCard = ({ user }) => {
  const { name, email, skills_to_offer = [], skills_to_learn = [], _id, bio } = user;

  return (
    <div className="card h-100 shadow-sm border-0 user-card-hover">
      <div className="card-body d-flex flex-column">
        {/* Avatar y nombre */}
        <div className="text-center mb-3">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
               style={{ width: '80px', height: '80px', fontSize: '2rem', fontWeight: 'bold' }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <h5 className="card-title mb-1 text-dark fw-bold">{name}</h5>
          <p className="text-muted small mb-0">{email}</p>
          {bio && (
            <p className="text-muted small mt-2 fst-italic">"{bio}"</p>
          )}
        </div>
        
        {/* Habilidades que ofrece */}
        <div className="mb-3 flex-grow-1">
          <h6 className="fw-bold text-success mb-2">
            <i className="fas fa-hand-holding me-1"></i>
            Ofrece:
          </h6>
          <div className="d-flex flex-wrap gap-1">
            {skills_to_offer.length > 0 ? (
              skills_to_offer.slice(0, 3).map((skill, index) => (
                <span key={index} className="badge bg-success bg-opacity-15 text-success border border-success rounded-pill px-2 py-1">
                  {skill}
                </span>
              ))
            ) : (
              <small className="text-muted fst-italic">No especificado</small>
            )}
            {skills_to_offer.length > 3 && (
              <span className="badge bg-success bg-opacity-15 text-success border border-success rounded-pill px-2 py-1">
                +{skills_to_offer.length - 3} más
              </span>
            )}
          </div>
        </div>
        
        {/* Habilidades que quiere aprender */}
        <div className="mb-4 flex-grow-1">
          <h6 className="fw-bold text-info mb-2">
            <i className="fas fa-graduation-cap me-1"></i>
            Quiere aprender:
          </h6>
          <div className="d-flex flex-wrap gap-1">
            {skills_to_learn.length > 0 ? (
              skills_to_learn.slice(0, 3).map((skill, index) => (
                <span key={index} className="badge bg-info bg-opacity-15 text-info border border-info rounded-pill px-2 py-1">
                  {skill}
                </span>
              ))
            ) : (
              <small className="text-muted fst-italic">No especificado</small>
            )}
            {skills_to_learn.length > 3 && (
              <span className="badge bg-info bg-opacity-15 text-info border border-info rounded-pill px-2 py-1">
                +{skills_to_learn.length - 3} más
              </span>
            )}
          </div>
        </div>
        
        {/* Botón de ver perfil */}
        <div className="mt-auto">
          <Link 
            to={`/profile/${_id}`} 
            className="btn btn-primary w-100 rounded-pill fw-semibold shadow-sm"
          >
            <i className="fas fa-user me-2"></i>
            Ver Perfil Completo
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        .user-card-hover {
          transition: all 0.3s ease;
        }
        .user-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default UserCard;
