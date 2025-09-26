import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api.jsx';

const AddSkillPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Principiante',
    tags: [],
    timeCommitment: 'Flexible',
    preferredFormat: 'Ambos',
    location: {
      city: '',
      country: ''
    }
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/skills/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Error al cargar las categorías');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    // Validaciones básicas
    if (!formData.title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    if (!formData.description.trim()) {
      setError('La descripción es obligatoria');
      return;
    }
    if (!formData.category) {
      setError('La categoría es obligatoria');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await api.post('/skills', formData);
      navigate('/profile');
    } catch (err) {
      console.error('Error al añadir la habilidad:', err);
      setError(err.response?.data?.msg || 'Error al guardar la habilidad');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Debes iniciar sesión para continuar</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 btn-primary"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <i className="fas fa-plus text-primary-600 mr-2"></i>
                Publicar Nueva Habilidad
              </h1>
              <p className="text-gray-600">Comparte tu conocimiento con la comunidad</p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Título de la habilidad *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: Desarrollo Web con React"
                  required
                  maxLength="100"
                />
                <small className="text-gray-500">Máximo 100 caracteres</small>
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción detallada *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe qué incluye tu habilidad, qué enseñarás, prerrequisitos, etc."
                  required
                  maxLength="500"
                />
                <small className="text-gray-500">{formData.description.length}/500 caracteres</small>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categoría */}
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Nivel */}
                <div>
                  <label htmlFor="level" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tu nivel en esta habilidad *
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                    <option value="Experto">Experto</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
                  Etiquetas (opcional)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  onChange={handleTagsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Separadas por comas: react, javascript, frontend"
                />
                <small className="text-gray-500">Las etiquetas ayudan a otros usuarios a encontrar tu habilidad</small>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tiempo disponible */}
                <div>
                  <label htmlFor="timeCommitment" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tiempo disponible
                  </label>
                  <select
                    id="timeCommitment"
                    name="timeCommitment"
                    value={formData.timeCommitment}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="1-2 horas/semana">1-2 horas/semana</option>
                    <option value="3-5 horas/semana">3-5 horas/semana</option>
                    <option value="6-10 horas/semana">6-10 horas/semana</option>
                    <option value="Más de 10 horas/semana">Más de 10 horas/semana</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                {/* Formato preferido */}
                <div>
                  <label htmlFor="preferredFormat" className="block text-sm font-semibold text-gray-700 mb-2">
                    Formato preferido
                  </label>
                  <select
                    id="preferredFormat"
                    name="preferredFormat"
                    value={formData.preferredFormat}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ubicación (opcional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ciudad"
                  />
                  <input
                    type="text"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="País"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="btn-outline-secondary flex-1"
                  disabled={isLoading}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Publicando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Publicar Habilidad
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSkillPage;
