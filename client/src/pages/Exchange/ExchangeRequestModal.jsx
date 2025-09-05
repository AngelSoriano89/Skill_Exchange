import React, { useState } from 'react';
import { FaTimes, FaEnvelope } from 'react-icons/fa';
import api from '../../api/api';

const ExchangeRequestModal = ({ onClose, recipient }) => {
  const [message, setMessage] = useState('');
  const [skills_to_offer, setSkillsToOffer] = useState([]);
  const [skills_to_learn, setSkillsToLearn] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exchanges/request', {
        recipientId: recipient._id,
        skills_to_offer,
        skills_to_learn,
        message,
      });
      setSuccess(true);
      setError(null);
    } catch (err) {
      setError('Error al enviar la solicitud. Intenta de nuevo.');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="relative p-8 bg-white w-96 max-w-lg mx-auto rounded-lg shadow-xl">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>
        <h3 className="text-xl font-semibold text-center mb-4">
          Solicitar Intercambio a {recipient.name}
        </h3>
        {success ? (
          <div className="text-center text-green-600">
            <p>¡Solicitud enviada con éxito!</p>
            <button onClick={onClose} className="mt-4 bg-green-500 text-white px-4 py-2 rounded-full">Cerrar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Mensaje
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Habilidades que ofreces
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Ej. 'Inglés, Cocina'"
                value={skills_to_offer.join(', ')}
                onChange={(e) => setSkillsToOffer(e.target.value.split(',').map(s => s.trim()))}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Habilidades que quieres aprender
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Ej. 'Música, Jardinería'"
                value={skills_to_learn.join(', ')}
                onChange={(e) => setSkillsToLearn(e.target.value.split(',').map(s => s.trim()))}
                required
              />
            </div>
            {error && <p className="text-red-500 text-center text-xs italic mb-4">{error}</p>}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                <FaEnvelope className="inline-block mr-2" /> Enviar Solicitud
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ExchangeRequestModal;
