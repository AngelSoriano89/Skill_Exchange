import React from 'react';

const SearchPage = () => {
  return (
    <div id="search-page" className="page w-full p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Encuentra tu próximo intercambio
        </h1>
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              placeholder="Buscar por habilidad (ej. Piano, Cocina, Programación)"
              className="w-full p-4 pl-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">&#x1f50e;&#xfe0e;</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="user-card card w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">María López</h3>
            <p className="text-sm text-gray-500 mb-4">¡Maestra de cocina!</p>
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-1">Ofrece:</h4>
              <div className="flex flex-wrap justify-center gap-1">
                <span className="skill-tag">Cocina</span>
                <span className="skill-tag">Repostería</span>
              </div>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-1">Quiere Aprender:</h4>
              <div className="flex flex-wrap justify-center gap-1">
                <span className="skill-tag">Idiomas</span>
              </div>
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors">Ver Perfil</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
