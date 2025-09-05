import React from 'react';

const ProfilePage = () => {
  return (
    <div id="profile-page" className="page w-full p-8">
      <div className="container mx-auto card max-w-4xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
          <div className="profile-avatar rounded-full"></div>
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Alex Sánchez</h1>
            <p className="text-gray-600 text-lg mb-4">Me encanta la programación y el diseño. Busco aprender a tocar la guitarra.</p>
            <div className="space-x-2">
              <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-300">
                <span className="icon">&#9999;</span> Editar Perfil
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700">
                <span className="icon">&#x2b;</span> Añadir Habilidad
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Habilidades</h2>
          <div className="flex flex-col md:flex-row md:space-x-8 space-y-6 md:space-y-0">
            <div className="w-full md:w-1/2">
              <h3 className="text-xl font-bold text-gray-700 mb-2">Ofrece</h3>
              <div className="flex flex-wrap gap-2">
                <span className="skill-tag">JavaScript</span>
                <span className="skill-tag">Node.js</span>
                <span className="skill-tag">MongoDB</span>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="text-xl font-bold text-gray-700 mb-2">Quiere Aprender</h3>
              <div className="flex flex-wrap gap-2">
                <span className="skill-tag">Guitarra</span>
                <span className="skill-tag">Fotografía</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
