import React from 'react';

const DashboardPage = () => {
  return (
    <div id="dashboard-page" className="page w-full p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">Bienvenido, Alex</h1>
        <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
          <div className="bg-white rounded-lg shadow-md p-6 w-full lg:w-1/2">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
              <span className="icon">&#9993;</span> Solicitudes Recibidas
            </h2>
            <div className="border-b border-gray-200 py-4">
              <p className="font-medium text-lg text-gray-800">
                <span className="font-bold">Juan</span> quiere intercambiar
              </p>
              <div className="mt-2 text-sm text-gray-500">
                <p>Ofrece: <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">Desarrollo Web</span></p>
                <p>Quiere aprender: <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs">Cocina</span></p>
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600">Aceptar</button>
                <button className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600">Rechazar</button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 w-full lg:w-1/2">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
              <span className="icon">&#x21c4;</span> Mis Intercambios
            </h2>
            <p className="text-gray-500">
              Aquí se mostrarán tus intercambios aceptados y completados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
