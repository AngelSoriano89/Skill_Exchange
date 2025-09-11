import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../api/api.jsx';
import { FaUserCircle, FaSave, FaCamera } from 'react-icons/fa';

const EditProfile = () => {
  const { user, isAuthenticated, checkAuthStatus } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills_to_offer: '',
    skills_to_learn: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        const res = await api.get(`/profile/${user._id}`);
        const profile = res.data;
        setFormData({
          name: profile.name,
          bio: profile.bio,
          skills_to_offer: profile.skills_to_offer.join(', '),
          skills_to_learn: profile.skills_to_learn.join(', '),
        });
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
        setError("No se pudo cargar la información del perfil.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user, isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('bio', formData.bio);
      data.append('skills_to_offer', formData.skills_to_offer);
      data.append('skills_to_learn', formData.skills_to_learn);
      if (avatar) {
        data.append('avatar', avatar);
      }

      await api.put(`/profile/${user._id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('¡Perfil actualizado con éxito!');
      checkAuthStatus(); // Actualiza el contexto de autenticación
      setTimeout(() => navigate(`/profile/${user._id}`), 2000);

    } catch (err) {
      console.error('Error al actualizar el perfil:', err);
      setError('Hubo un error al actualizar el perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-5"><h1 className="text-danger">{error}</h1></div>;
  }

  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body p-4 p-md-5">
          <h1 className="display-4 fw-bold text-center mb-4">Editar Perfil</h1>
          {success && <div className="alert alert-success text-center">{success}</div>}
          {error && <div className="alert alert-danger text-center">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Sección de Avatar */}
            <div className="text-center mb-4">
              <div className="position-relative d-inline-block">
                {user.avatar ? (
                  <img
                    src={`http://localhost:5000/uploads/${user.avatar}`}
                    alt="Avatar de perfil"
                    className="rounded-circle"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                ) : (
                  <FaUserCircle style={{ fontSize: '6rem', color: '#ccc' }} />
                )}
                <label
                  htmlFor="avatar-upload"
                  className="btn btn-secondary rounded-circle position-absolute bottom-0 end-0"
                  style={{ transform: 'translate(25%, 25%)' }}
                >
                  <FaCamera />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="d-none"
                  />
                </label>
              </div>
            </div>

            {/* Campos del Formulario */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="bio" className="form-label">Biografía</label>
              <textarea
                className="form-control"
                id="bio"
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="skills_to_offer" className="form-label">Habilidades que ofreces (separadas por coma)</label>
              <input
                type="text"
                className="form-control"
                id="skills_to_offer"
                name="skills_to_offer"
                value={formData.skills_to_offer}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="skills_to_learn" className="form-label">Habilidades que quieres aprender (separadas por coma)</label>
              <input
                type="text"
                className="form-control"
                id="skills_to_learn"
                name="skills_to_learn"
                value={formData.skills_to_learn}
                onChange={handleChange}
              />
            </div>
            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                <FaSave className="me-2" /> Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
