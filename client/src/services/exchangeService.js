import api from '../api/api';

const exchangeService = {
  // Crear solicitud de intercambio
  createExchangeRequest: async (exchangeData) => {
    const response = await api.post('/exchanges/request', exchangeData);
    return response.data;
  },

  // Obtener solicitudes recibidas
  getReceivedExchanges: async () => {
    const response = await api.get('/exchanges/received');
    return response.data;
  },

  // Obtener solicitudes enviadas
  getSentExchanges: async () => {
    const response = await api.get('/exchanges/sent');
    return response.data;
  },

  // Obtener intercambios aceptados
  getAcceptedExchanges: async () => {
    const response = await api.get('/exchanges/accepted');
    return response.data;
  },

  // Obtener intercambios completados
  getCompletedExchanges: async () => {
    const response = await api.get('/exchanges/completed');
    return response.data;
  },

  // Aceptar intercambio
  acceptExchange: async (exchangeId) => {
    const response = await api.post(`/exchanges/accept/${exchangeId}`);
    return response.data;
  },

  // Rechazar intercambio
  rejectExchange: async (exchangeId) => {
    const response = await api.post(`/exchanges/reject/${exchangeId}`);
    return response.data;
  },

  // Completar intercambio
  completeExchange: async (exchangeId) => {
    const response = await api.put(`/exchanges/complete/${exchangeId}`);
    return response.data;
  },

  // Obtener información de contacto
  getContactInfo: async (exchangeId) => {
    const response = await api.get(`/exchanges/contact/${exchangeId}`);
    return response.data;
  }
};

export default exchangeService;
