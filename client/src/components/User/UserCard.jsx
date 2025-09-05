import React from 'react';
import { Link } from 'react-router-dom';

const UserCard = ({ user }) => {
  const { name, email, skills_to_offer, skills_to_learn, _id } = user;

  return (
    <div className="card text-center h-100 shadow-sm transition-shadow duration-300">
      <div className="card-body d-flex flex-column align-items-center">
        {/* Avatar */}
        <div className="bg-secondary bg-opacity-25 text-dark d-flex align-items-center justify-content-center fw-bold rounded-circle" style={{ width: '96px', height: '96px', fontSize: '2.5rem' }}>
          {name.charAt(0).toUpperCase()}
        </div>
        {/* /Avatar */}

        <h3 className="card-title mt-4 mb-1 fw-bold">{name}</h3>
        <p className="card-subtitle text-muted mb-4">{email}</p>

        {/* Habilidades a ofrecer */}
        <div className="w-100 text-start mb-3">
          <h4 className="fw-semibold text-secondary">Ofrece:</h4>
          <div className="d-flex flex-wrap gap-2 mt-1">
            {skills_to_offer.map((skill, index) => (
              <span key={index} className="badge bg-primary text-wrap rounded-pill px-3 py-1 text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
        {/* /Habilidades a ofrecer */}

        {/* Habilidades a aprender */}
        <div className="w-100 text-start mb-3">
          <h4 className="fw-semibold text-secondary">Quiere aprender:</h4>
          <div className="d-flex flex-wrap gap-2 mt-1">
            {skills_to_learn.map((skill, index) => (
              <span key={index} className="badge bg-success text-wrap rounded-pill px-3 py-1 text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
        {/* /Habilidades a aprender */}

        <Link to={`/profile/${_id}`} className="btn btn-primary fw-semibold rounded-pill w-100 mt-auto shadow">
          Ver Perfil
        </Link>
      </div>
    </div>
  );
};

export default UserCard;
