import React, { useState } from 'react';
import api from '../../api/api.jsx';
import { buildAvatarUrl } from '../../api/api';

const EditProfileModal = ({ user, onClose, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
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

  const [avatar, setAvatar] = useState(null);
  const cacheKey = user?.updatedAt || user?.date || user?._id || '';
  const initialAvatar = user?.avatar ? buildAvatarUrl(user.avatar, cacheKey) : '';
  const [avatarPreview, setAvatarPreview] = useState(initialAvatar);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const experienceLevels = [
    'Principiante',
    'Intermedio',
    'Avanzado',
    'Experto',
    'Profesional'
  ];

  const handleInputChange = (e) => {
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

      onProfileUpdated(response.data);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.msg || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          {/* Header */}
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title d-flex align-items-center">
              <i className="fas fa-user-edit me-2"></i>
              Editar mi perfil
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          <div className="modal-body p-0">
            {/* Tabs */}
            <div className="border-bottom">
              <ul className="nav nav-tabs nav-fill">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`}
                    onClick={() => setActiveTab('basic')}
                    type="button"
                  >
                    <i className="fas fa-user me-2"></i>
                    Información Básica
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'skills' ? 'active' : ''}`}
                    onClick={() => setActiveTab('skills')}
                    type="button"
                  >
                    <i className="fas fa-brain me-2"></i>
                    Habilidades
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'additional' ? 'active' : ''}`}
                    onClick={() => setActiveTab('additional')}
                    type="button"
                  >
                    <i className="fas fa-plus-circle me-2"></i>
                    Información Adicional
                  </button>
                </li>
              </ul>
            </div>

            <div className="p-4">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Tab: Información Básica */}
                {activeTab === 'basic' && (
                  <div className="tab-pane fade show active">
                    <div className="row">
                      {/* Avatar */}
                      <div className="col-md-4 text-center mb-4">
                        <h6 className="fw-bold mb-3">Foto de perfil</h6>
                        <div className="position-relative d-inline-block">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="Avatar preview"
                              className="rounded-circle object-fit-cover border"
                              style={{ width: '150px', height: '150px' }}
                            />
                          ) : (
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center border" 
                                 style={{ width: '150px', height: '150px', fontSize: '3rem', fontWeight: 'bold' }}>
                              {formData.name.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                          {avatarPreview && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
                              style={{ width: '30px', height: '30px' }}
                              onClick={removeAvatar}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>
                        <div className="mt-3">
                          <input
                            id="avatar-input"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="form-control form-control-sm"
                          />
                          <small className="form-text text-muted">
                            Máximo 5MB. Formatos: JPG, PNG, GIF
                          </small>
                        </div>
                      </div>

                      {/* Información personal */}
                      <div className="col-md-8">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">
                              <i className="fas fa-user me-2 text-primary"></i>
                              Nombre completo *
                            </label>
                            <input
                              type="text"
                              name="name"
                              className="form-control"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              disabled={loading}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">
                              <i className="fas fa-phone me-2 text-success"></i>
                              Teléfono
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              className="form-control"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="+1234567890"
                              disabled={loading}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">
                              <i className="fas fa-map-marker-alt me-2 text-danger"></i>
                              Ubicación
                            </label>
                            <input
                              type="text"
                              name="location"
                              className="form-control"
                              value={formData.location}
                              onChange={handleInputChange}
                              placeholder="Ciudad, País"
                              disabled={loading}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">
                              <i className="fas fa-star me-2 text-warning"></i>
                              Nivel de experiencia
                            </label>
                            <select
                              name="experience"
                              className="form-select"
                              value={formData.experience}
                              onChange={handleInputChange}
                              disabled={loading}
                            >
                              {experienceLevels.map(level => (
                                <option key={level} value={level}>{level}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-12 mb-3">
                            <label className="form-label fw-bold">
                              <i className="fas fa-quote-right me-2 text-info"></i>
                              Biografía
                            </label>
                            <textarea
                              name="bio"
                              className="form-control"
                              rows="4"
                              value={formData.bio}
                              onChange={handleInputChange}
                              placeholder="Cuéntanos sobre ti, tus intereses, experiencia y lo que te motiva a intercambiar habilidades..."
                              maxLength="500"
                              disabled={loading}
                            />
                            <div className="form-text">
                              {formData.bio.length}/500 caracteres
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Habilidades */}
                {activeTab === 'skills' && (
                  <div className="tab-pane fade show active">
                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <div className="border rounded p-3 h-100 bg-success bg-opacity-10">
                          <label className="form-label fw-bold text-success">
                            <i className="fas fa-hand-holding me-2"></i>
                            Habilidades que puedo enseñar
                          </label>
                          <textarea
                            name="skills_to_offer"
                            className="form-control"
                            rows="6"
                            value={formData.skills_to_offer}
                            onChange={handleInputChange}
                            placeholder="JavaScript, React, Cocina italiana, Guitarra, Inglés..."
                            disabled={loading}
                          />
                          <div className="form-text">
                            Separa cada habilidad con una coma. Sé específico para mejores resultados.
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 mb-4">
                        <div className="border rounded p-3 h-100 bg-info bg-opacity-10">
                          <label className="form-label fw-bold text-info">
                            <i className="fas fa-graduation-cap me-2"></i>
                            Habilidades que quiero aprender
                          </label>
                          <textarea
                            name="skills_to_learn"
                            className="form-control"
                            rows="6"
                            value={formData.skills_to_learn}
                            onChange={handleInputChange}
                            placeholder="Piano, Fotografía, Marketing digital, Francés, Yoga..."
                            disabled={loading}
                          />
                          <div className="form-text">
                            Separa cada habilidad con una coma. Esto ayudará a otros a encontrarte.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="alert alert-primary" role="alert">
                      <h6 className="alert-heading">
                        <i className="fas fa-lightbulb me-2"></i>
                        Consejos para mejores intercambios:
                      </h6>
                      <ul className="mb-0">
                        <li>Sé específico: "Guitarra acústica para principiantes" en lugar de solo "Guitarra"</li>
                        <li>Incluye tu nivel: "JavaScript intermedio" o "Cocina italiana básica"</li>
                        <li>Menciona herramientas o métodos: "Photoshop para diseño" o "Yoga Hatha"</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Tab: Información Adicional */}
                {activeTab === 'additional' && (
                  <div className="tab-pane fade show active">
                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-bold">
                          <i className="fas fa-language me-2 text-primary"></i>
                          Idiomas que hablas
                        </label>
                        <input
                          type="text"
                          name="languages"
                          className="form-control"
                          value={formData.languages}
                          onChange={handleInputChange}
                          placeholder="Español, Inglés, Francés..."
                          disabled={loading}
                        />
                        <div className="form-text">
                          Separa los idiomas con comas
                        </div>
                      </div>

                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-bold">
                          <i className="fas fa-heart me-2 text-danger"></i>
                          Intereses y hobbies
                        </label>
                        <input
                          type="text"
                          name="interests"
                          className="form-control"
                          value={formData.interests}
                          onChange={handleInputChange}
                          placeholder="Música, Deportes, Lectura, Viajes..."
                          disabled={loading}
                        />
                        <div className="form-text">
                          Separa los intereses con comas
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="alert alert-info" role="alert">
                          <h6 className="alert-heading">
                            <i className="fas fa-info-circle me-2"></i>
                            ¿Por qué es importante completar tu perfil?
                          </h6>
                          <ul className="mb-0">
                            <li><strong>Mayor visibilidad:</strong> Aparecerás en más búsquedas relevantes</li>
                            <li><strong>Mejor matching:</strong> Te conectaremos con personas más compatibles</li>
                            <li><strong>Más confianza:</strong> Los perfiles completos generan más intercambios exitosos</li>
                            <li><strong>Comunicación efectiva:</strong> Otros sabrán mejor cómo contactarte</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="modal-footer bg-light">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              <i className="fas fa-times me-2"></i>
              Cancelar
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Guardando cambios...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
