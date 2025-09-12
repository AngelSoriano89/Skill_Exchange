import api from '../api/api';

const ratingService = {
  // Crear calificación
  createRating: async (ratingData) => {
    const response = await api.post('/ratings', ratingData);
    return response.data;
  },

  // Obtener calificaciones de un usuario
  getUserRatings: async (userId) => {
    const response = await api.get(`/ratings/user/${userId}`);
    return response.data;
  },

  // Obtener mis calificaciones (las que he dado)
  getMyRatings: async () => {
    const response = await api.get('/ratings/my-ratings');
    return response.data;
  },

  // Obtener calificaciones de un intercambio específico
  getExchangeRatings: async (exchangeId) => {
    const response = await api.get(`/ratings/exchange/${exchangeId}`);
    return response.data;
  },

  // Actualizar calificación
  updateRating: async (ratingId, ratingData) => {
    const response = await api.put(`/ratings/${ratingId}`, ratingData);
    return response.data;
  },

  // Eliminar calificación
  deleteRating: async (ratingId) => {
    const response = await api.delete(`/ratings/${ratingId}`);
    return response.data;
  }
};

export default ratingService;
