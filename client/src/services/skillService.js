import api from '../api/api';

const skillService = {
  // Obtener todas las habilidades con filtros
  getSkills: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/skills?${params.toString()}`);
    return response.data;
  },

  // Obtener mis habilidades
  getMySkills: async () => {
    const response = await api.get('/skills/my-skills');
    return response.data;
  },

  // Obtener habilidad por ID
  getSkillById: async (id) => {
    const response = await api.get(`/skills/${id}`);
    return response.data;
  },

  // Obtener habilidades de un usuario específico
  getSkillsByUser: async (userId) => {
    const response = await api.get(`/skills/user/${userId}`);
    return response.data;
  },

  // Crear nueva habilidad
  createSkill: async (skillData) => {
    const response = await api.post('/skills', skillData);
    return response.data;
  },

  // Actualizar habilidad
  updateSkill: async (id, skillData) => {
    const response = await api.put(`/skills/${id}`, skillData);
    return response.data;
  },

  // Eliminar habilidad
  deleteSkill: async (id) => {
    const response = await api.delete(`/skills/${id}`);
    return response.data;
  },

  // Obtener categorías disponibles
  getCategories: async () => {
    const response = await api.get('/skills/categories');
    return response.data;
  }
};

export default skillService;
