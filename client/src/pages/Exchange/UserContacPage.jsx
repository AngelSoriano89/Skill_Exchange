import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { AuthContext } from '../../context/AuthContext';
import { FaEnvelope, FaPhone, FaCheckCircle } from 'react-icons/fa';

const UserContactPage = () => {
  const { exchangeId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExchangeDetails = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/exchanges/${exchangeId}`);
        setExchange(res.data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la información del intercambio.');
      } finally {
        setLoading(false);
      }
    };
    fetchExchangeDetails();
  }, [exchangeId, user]);

  const handleCompleteExchange = async () => {
    try {
      await api.put(`/exchanges/complete/${exchangeId}`);
      alert('Intercambio marcado como completado. ¡Aprende mucho!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Error al completar el intercambio.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Cargando detalles del intercambio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md">{error}</div>
      </div>
    );
  }

  const otherUser = exchange.sender._id === user._id ? exchange.recipient : exchange.sender;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 sm:p-12 text-center max-w-xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">¡Intercambio Aceptado!</h1>
        <p className="text-lg text-gray-600 mb-6">
          Ahora puedes contactar a <span className="font-semibold">{otherUser.name}</span> para coordinar.
        </p>

        <div className="bg-gray-200 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Información de Contacto</h2>
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-800 flex items-center">
              <FaEnvelope className="mr-2 text-blue-500" />
              <span className="font-semibold">Correo:</span> {otherUser.email}
            </p>
            {/* Si el perfil tuviera un teléfono, se mostraría aquí */}
            {otherUser.phone && (
              <p className="text-gray-800 flex items-center">
                <FaPhone className="mr-2 text-green-500" />
                <span className="font-semibold">Teléfono:</span> {otherUser.phone}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleCompleteExchange}
          className="bg-green-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-green-700 transition-colors duration-200 shadow-lg"
        >
          <FaCheckCircle className="inline-block mr-2" />
          Marcar Intercambio como Completado
        </button>
      </div>
    </div>
  );
};

export default UserContactPage;
