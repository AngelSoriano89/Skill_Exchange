import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api';

const EditProfile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    location: '',
    experience: 'Principiante',
    skills_to_offer: '',
    skills_to_learn: '',
    languages: '',
    interests: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const experienceLevels = [
    'Principiante',
    'Intermedio',
    'Avanzado',
    'Experto',
    'Profesional'
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Inicializar formData con datos del usuario
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      phone: user.phone || '',
      location: user.location || '',
      experience: user.experience || 'Principiante',
      skills_to_offer: user.skills_to_offer ? user.skills_to_offer.join(', ') : '',
      skills_to_learn: user.skills_to_learn ? user.skills_to_learn.join(', ') : '',
      languages: user.languages ? user.languages.join(', ') : '',
      interests: user.interests ? user.interests.join(', ') : '',
    });

    // Establecer preview del avatar actual
    if (user.avatar) {
      const avatarUrl = user.avatar.startsWith('http') 
        ? user.avatar 
        : `http://localhost:5000${user.avatar}`;
      setAvatarPreview(avatarUrl);
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }

      setAvatar(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview('');
    document.getElementById('avatar-input').value = '';
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    if (formData.bio.length > 500) {
      setError('La biografía no puede superar los 500 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = new FormData();
      
      // Datos básicos
      updateData.append('name', formData.name.trim());
      updateData.append('bio', formData.bio.trim());
      updateData.append('phone', formData.phone.trim());
      updateData.append('location', formData.location.trim());
      updateData.append('experience', formData.experience);
      
      // Convertir strings separados por comas en arrays
      const skillsToOffer = formData.skills_to_offer
        ? formData.skills_to_offer.split(',').map(s => s.trim()).filter(s => s)
        : [];
      const skillsToLearn = formData.skills_to_learn
        ? formData.skills_to_learn.split(',').map(s => s.trim()).filter(s => s)
        : [];
      const languages = formData.languages
        ? formData.languages.split(',').map(s => s.trim()).filter(s => s)
        : [];
      const interests = formData.interests
        ? formData.interests.split(',').map(s => s.trim()).filter(s => s)
        : [];

      updateData.append('skills_to_offer', JSON.stringify(skillsToOffer));
      updateData.append('skills_to_learn', JSON.stringify(skillsToLearn));
      updateData.append('languages', JSON.stringify(languages));
      updateData.append('interests', JSON.stringify(interests));

      // Avatar si hay uno nuevo
      if (avatar) {
        updateData.append('avatar', avatar);
      }

      const response = await api.put('/users/me', updateData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Actualizar el contexto con los nuevos datos
      updateUser(response.data);
      
      setSuccess('¡Perfil actualizado exitosamente!');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.msg || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const renderAvatar = () => {
    if (avatarPreview) {
      return (
        <img
          src={avatarPreview}
          alt="Avatar preview"
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
        />
      );
    }
    
    return (
      <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
        {formData.name.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <i className="fas fa-user-edit text-primary-600 mr-2"></i>
                Editar mi perfil
              </h1>
              <p className="text-gray-600">Actualiza tu información y habilidades</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                <i className="fas fa-check-circle mr-2"></i>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Avatar Section */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Foto de perfil</h3>
                  <div className="relative inline-block mb-4">
                    {renderAvatar()}
                    {avatarPreview && (
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        onClick={removeAvatar}
                      >
                        <i className="fas fa-times text-sm"></i>
                      </button>
                    )}
                  </div>
                  <div>
                    <input
                      id="avatar-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('avatar-input').click()}
                      className="btn-outline-primary text-sm"
                    >
                      <i className="fas fa-camera mr-2"></i>
                      {avatarPreview ? 'Cambiar foto' : 'Subir foto'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Máximo 5MB. Formatos: JPG, PNG, GIF
                  </p>
                </div>

                {/* Basic Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        <i className="fas fa-user text-primary-600 mr-2"></i>
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        <i className="fas fa-phone text-green-600 mr-2"></i>
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="+1234567890"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                        <i className="fas fa-map-marker-alt text-red-600 mr-2"></i>
                        Ubicación
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Ciudad, País"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label htmlFor="experience" className="block text-sm font-semibold text-gray-700 mb-2">
                        <i className="fas fa-star text-yellow-500 mr-2"></i>
                        Nivel de experiencia
                      </label>
                      <select
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={loading}
                      >
                        {experienceLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="fas fa-quote-right text-indigo-600 mr-2"></i>
                      Biografía
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows="4"
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Cuéntanos sobre ti, tus intereses, experiencia y lo que te motiva a intercambiar habilidades..."
                      maxLength="500"
                      disabled={loading}
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {formData.bio.length}/500 caracteres
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <label htmlFor="skills_to_offer" className="block text-sm font-semibold text-green-700 mb-2">
                    <i className="fas fa-hand-holding mr-2"></i>
                    Habilidades que puedo enseñar
                  </label>
                  <textarea
                    id="skills_to_offer"
                    name="skills_to_offer"
                    rows="4"
                    value={formData.skills_to_offer}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    placeholder="JavaScript, React, Cocina italiana, Guitarra, Inglés..."
                    disabled={loading}
                  />
                  <p className="text-xs text-green-600 mt-2">
                    Separa cada habilidad con una coma. Sé específico para mejores resultados.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <label htmlFor="skills_to_learn" className="block text-sm font-semibold text-blue-700 mb-2">
                    <i className="fas fa-graduation-cap mr-2"></i>
                    Habilidades que quiero aprender
                  </label>
                  <textarea
                    id="skills_to_learn"
                    name="skills_to_learn"
                    rows="4"
                    value={formData.skills_to_learn}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="Piano, Fotografía, Marketing digital, Francés, Yoga..."
                    disabled={loading}
                  />
                  <p className="text-xs text-blue-600 mt-2">
                    Separa cada habilidad con una coma. Esto ayudará a otros a encontrarte.
                  </p>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label htmlFor="languages" className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-language text-purple-600 mr-2"></i>
                    Idiomas que hablas
                  </label>
                  <input
                    type="text"
                    id="languages"
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Español, Inglés, Francés..."
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separa los idiomas con comas
                  </p>
                </div>

                <div>
                  <label htmlFor="interests" className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-heart text-red-600 mr-2"></i>
                    Intereses y hobbies
                  </label>
                  <input
                    type="text"
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Música, Deportes, Lectura, Viajes..."
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separa los intereses con comas
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => navigate('/profile')}
                  className="btn-outline-secondary flex-1"
                  disabled={loading}
                >
                  <i className="fas fa-times mr-2"></i>
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Guardando cambios...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Guardar cambios
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

export default EditProfile;
