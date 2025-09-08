import React, { useState, useContext, useEffect } from 'react';
import { FaPlus, FaSave, FaArrowLeft, FaInfoCircle, FaTags, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import skillService from '../../services/skillService';
import { handleApiError, showSuccessAlert, showLoadingAlert, closeLoadingAlert } from '../../utils/sweetAlert';
import Select from 'react-select';

const AddSkillPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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
    const fetchCategories = async () => {
      try {
        const categoriesData = await skillService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        handleApiError(error);
      }
    };
    fetchCategories();
  }, []);

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

  const handleTagsChange = (selectedOptions) => {
    const tags = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    showLoadingAlert('Publicando habilidad...', 'Creando tu nueva habilidad');
    
    try {
<<<<<<< HEAD
      await skillService.createSkill(formData);
      closeLoadingAlert();
      showSuccessAlert('¡Habilidad publicada!', 'Tu habilidad ya está visible para otros usuarios.');
      navigate('/dashboard');
    } catch (error) {
      closeLoadingAlert();
      handleApiError(error);
    } finally {
      setIsLoading(false);
=======
      if (user) { // CORRECCIÓN: Asegura que el usuario existe
        // Enviar la nueva habilidad a la API
        await api.post(`/skills/${user._id}`, formData); // Usa user._id
        alert('¡Habilidad añadida con éxito!');
        navigate(`/profile/${user._id}`); // Usa user._id
      } else {
        alert('Error: No se encontró el usuario. Por favor, inicia sesión de nuevo.');
      }
    } catch (err) {
      console.error('Error al añadir la habilidad:', err);
      alert('Hubo un error al guardar la habilidad.');
>>>>>>> 8be2632a23ad0f0a877621d5db145efe8ff24e19
    }
  };

  // Opciones para el select de tags
  const tagOptions = [
    { value: 'web', label: 'Desarrollo Web' },
    { value: 'mobile', label: 'Móvil' },
    { value: 'design', label: 'Diseño' },
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'database', label: 'Base de Datos' },
    { value: 'ui-ux', label: 'UI/UX' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'seo', label: 'SEO' },
    { value: 'photography', label: 'Fotografía' },
    { value: 'video', label: 'Video' },
    { value: 'music', label: 'Música' },
    { value: 'writing', label: 'Escritura' },
    { value: 'teaching', label: 'Enseñanza' },
    { value: 'cooking', label: 'Cocina' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'language', label: 'Idiomas' },
    { value: 'business', label: 'Negocios' },
    { value: 'finance', label: 'Finanzas' }
  ];

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow border-0 rounded-4">
              <div className="card-header bg-primary text-white text-center">
                <h1 className="h4 fw-bold mb-0 d-flex align-items-center justify-content-center">
                  <FaPlus className="me-2" /> Publicar Nueva Habilidad
                </h1>
                <p className="mb-0 small opacity-75 mt-1">Comparte tu conocimiento con la comunidad</p>
              </div>
              
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {/* Título de la habilidad */}
                  <div className="mb-4">
                    <label htmlFor="title" className="form-label fw-semibold">
                      Título de la habilidad *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Ej: Desarrollo Web con React"
                      required
                      maxLength="100"
                    />
                    <small className="text-muted">Máximo 100 caracteres</small>
                  </div>

                  {/* Descripción */}
                  <div className="mb-4">
                    <label htmlFor="description" className="form-label fw-semibold">
                      Descripción detallada *
                      <FaInfoCircle className="ms-1 text-muted" size={14} title="Describe qué enseñarás y qué aprenderá el estudiante" />
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Describe qué incluye tu habilidad, qué enseñarás, prerrequisitos, etc."
                      required
                      maxLength="500"
                    />
                    <small className="text-muted">{formData.description.length}/500 caracteres</small>
                  </div>

                  <div className="row">
                    {/* Categoría */}
                    <div className="col-md-6 mb-4">
                      <label htmlFor="category" className="form-label fw-semibold">
                        Categoría *
                      </label>
                      <select
                        className="form-select"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona una categoría</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Nivel */}
                    <div className="col-md-6 mb-4">
                      <label htmlFor="level" className="form-label fw-semibold">
                        Tu nivel en esta habilidad *
                      </label>
                      <select
                        className="form-select"
                        id="level"
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
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
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <FaTags className="me-1" /> Etiquetas
                      <small className="text-muted ms-2">(opcional, máximo 10)</small>
                    </label>
                    <Select
                      isMulti
                      name="tags"
                      options={tagOptions}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      onChange={handleTagsChange}
                      placeholder="Selecciona etiquetas relacionadas..."
                      noOptionsMessage={() => "No hay más opciones"}
                      isSearchable
                      maxMenuHeight={200}
                    />
                    <small className="text-muted">Las etiquetas ayudan a otros usuarios a encontrar tu habilidad</small>
                  </div>

                  <div className="row">
                    {/* Compromiso de tiempo */}
                    <div className="col-md-6 mb-4">
                      <label htmlFor="timeCommitment" className="form-label fw-semibold">
                        Tiempo disponible
                      </label>
                      <select
                        className="form-select"
                        id="timeCommitment"
                        name="timeCommitment"
                        value={formData.timeCommitment}
                        onChange={handleChange}
                      >
                        <option value="1-2 horas/semana">1-2 horas/semana</option>
                        <option value="3-5 horas/semana">3-5 horas/semana</option>
                        <option value="6-10 horas/semana">6-10 horas/semana</option>
                        <option value="Más de 10 horas/semana">Más de 10 horas/semana</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>

                    {/* Formato preferido */}
                    <div className="col-md-6 mb-4">
                      <label htmlFor="preferredFormat" className="form-label fw-semibold">
                        Formato preferido
                      </label>
                      <select
                        className="form-select"
                        id="preferredFormat"
                        name="preferredFormat"
                        value={formData.preferredFormat}
                        onChange={handleChange}
                      >
                        <option value="Presencial">Presencial</option>
                        <option value="Virtual">Virtual</option>
                        <option value="Ambos">Ambos</option>
                      </select>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <FaMapMarkerAlt className="me-1" /> Ubicación
                      <small className="text-muted ms-2">(opcional)</small>
                    </label>
                    <div className="row">
                      <div className="col-md-6">
                        <input
                          type="text"
                          className="form-control"
                          name="location.city"
                          value={formData.location.city}
                          onChange={handleChange}
                          placeholder="Ciudad"
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="text"
                          className="form-control"
                          name="location.country"
                          value={formData.location.country}
                          onChange={handleChange}
                          placeholder="País"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="d-flex flex-column flex-sm-row gap-3 justify-content-end pt-3 border-top">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="btn btn-outline-secondary rounded-pill px-4"
                      disabled={isLoading}
                    >
                      <FaArrowLeft className="me-2" /> Volver al Dashboard
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary rounded-pill px-4"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Publicando...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" /> Publicar Habilidad
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
<<<<<<< HEAD
            </div>
            
            {/* Información adicional */}
            <div className="card border-0 bg-info bg-opacity-10 mt-4">
              <div className="card-body">
                <h6 className="fw-bold text-info"><FaInfoCircle className="me-2" />Consejos para una buena habilidad</h6>
                <ul className="small text-muted mb-0">
                  <li>Sé específico en el título y descripción</li>
                  <li>Incluye qué aprenderá el estudiante</li>
                  <li>Menciona cualquier prerrequisito necesario</li>
                  <li>Sé honesto sobre tu nivel de experiencia</li>
                </ul>
=======
              <div className="d-flex justify-content-end gap-2">
                {user && (
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="btn btn-outline-secondary rounded-pill px-4"
                >
                  <FaArrowLeft className="me-1" /> Volver
                </button>
                )}
                <button type="submit" className="btn btn-primary rounded-pill px-4">
                  <FaSave className="me-1" /> Guardar Habilidad
                </button>
>>>>>>> 8be2632a23ad0f0a877621d5db145efe8ff24e19
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSkillPage;
