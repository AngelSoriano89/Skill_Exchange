import React from 'react';
import { Link } from 'react-router-dom';

const UserCard = ({ user }) => {
  const { name, email, skills_to_offer, skills_to_learn, _id } = user;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-500 mb-4">
        {name.charAt(0).toUpperCase()}
      </div>
      <h3 className="text-xl font-bold mb-1">{name}</h3>
      <p className="text-sm text-gray-500 mb-4">{email}</p>
      
      <div className="w-full text-left mb-4">
        <h4 className="font-semibold text-gray-700">Ofrece:</h4>
        <div className="flex flex-wrap gap-2 mt-1">
          {skills_to_offer.map((skill, index) => (
            <span key={index} className="skill-tag bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="w-full text-left mb-4">
        <h4 className="font-semibold text-gray-700">Quiere aprender:</h4>
        <div className="flex flex-wrap gap-2 mt-1">
          {skills_to_learn.map((skill, index) => (
            <span key={index} className="skill-tag bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <Link to={`/profile/${_id}`} className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-indigo-700 transition-colors duration-200 shadow-lg w-full">
        Ver Perfil
      </Link>
    </div>
  );
};

export default UserCard;
