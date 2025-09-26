import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../Common/Avatar';

const UserCard = ({ user }) => {
  const { name, email, skills_to_offer = [], skills_to_learn = [], _id, bio, location, experience } = user;

  return (
    <div className="card card-hover group p-6 h-full flex flex-col">
      {/* Avatar + Info Básica */}
      <div className="text-center mb-4">
        <div className="relative mb-4">
          <Avatar 
            user={user}
            size="xl"
            className="mx-auto mb-4"
          />
          
          {/* Badge de experiencia */}
          {experience && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <span className="badge-warning text-xs px-2 py-1">
                {experience}
              </span>
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-gray-500 mb-2">{email}</p>
        
        {location && (
          <p className="text-xs text-gray-400 flex items-center justify-center">
            <i className="fas fa-map-marker-alt mr-1"></i>
            {location}
          </p>
        )}
        
        {bio && (
          <p className="text-sm text-gray-600 italic mt-3 line-clamp-2">
            "{bio}"
          </p>
        )}
      </div>
      
      {/* Habilidades que ofrece */}
      <div className="mb-4 flex-grow">
        <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center">
          <i className="fas fa-hand-holding mr-2"></i>
          Enseña:
        </h4>
        <div className="flex flex-wrap gap-1 mb-3">
          {skills_to_offer.length > 0 ? (
            <>
              {skills_to_offer.slice(0, 3).map((skill, index) => (
                <span key={index} className="badge-success text-xs">
                  {skill}
                </span>
              ))}
              {skills_to_offer.length > 3 && (
                <span className="badge-success text-xs">
                  +{skills_to_offer.length - 3} más
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400 italic">No especificado</span>
          )}
        </div>
      </div>
      
      {/* Habilidades que quiere aprender */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
          <i className="fas fa-graduation-cap mr-2"></i>
          Quiere aprender:
        </h4>
        <div className="flex flex-wrap gap-1">
          {skills_to_learn.length > 0 ? (
            <>
              {skills_to_learn.slice(0, 3).map((skill, index) => (
                <span key={index} className="badge-info text-xs">
                  {skill}
                </span>
              ))}
              {skills_to_learn.length > 3 && (
                <span className="badge-info text-xs">
                  +{skills_to_learn.length - 3} más
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400 italic">No especificado</span>
          )}
        </div>
      </div>
      
      {/* Botón de acción */}
      <div className="mt-auto">
        <Link 
          to={`/profile/${_id}`} 
          className="w-full btn-primary text-center block group-hover:bg-primary-700 transition-colors"
        >
          <i className="fas fa-user-circle mr-2"></i>
          Ver Perfil Completo
        </Link>
      </div>
      
      {/* Indicadores de compatibilidad */}
      {(skills_to_offer.length > 0 || skills_to_learn.length > 0) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center">
              <i className="fas fa-star text-yellow-500 mr-1"></i>
              {skills_to_offer.length} habilidades
            </span>
            <span className="flex items-center">
              <i className="fas fa-target text-blue-500 mr-1"></i>
              {skills_to_learn.length} objetivos
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCard;
