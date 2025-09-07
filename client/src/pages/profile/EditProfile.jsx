import React, { useState, useContext, useEffect } from 'react';
import { FaUserCircle, FaSave, FaArrowLeft, FaCamera } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api'; // Asegúrate de que esta ruta sea correcta

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
  });
  const [avatar, setAvatar] = useState(null); // Nuevo estado para la foto de perfil

  // useEffect para cargar los datos actuales del usuario al montar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const res = await api.get(`/profile/${user.id}`); // Llama a la API para obtener los datos
          setFormData({
            name: res.data.name,
            bio: res.data.bio,
          });
        } catch (err) {
          console.error('Error al cargar datos del perfil:', err);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Usar FormData para enviar datos y el archivo
      const data = new FormData();
      data.append('name', formData.name);
      data.append('bio', formData.bio);
      if (avatar) {
        data.append('avatar', avatar);
      }

      // Enviar los datos al backend
      await api.put(`/profile/${user.id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('¡Perfil actualizado con éxito!');
      navigate(`/profile/${user.id}`);
    } catch (err) {
      console.error('Error al actualizar el perfil:', err.response.data);
      alert('Hubo un error al guardar los cambios.');
    }
  };

  return (
    <div className="d-flex flex-column align-items-center bg-light w-100 p-4 min-vh-100">
      <div className="container py-5">
        <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '600px', margin: 'auto' }}>
          <div className="card-body p-4 p-md-5">
            <h1 className="h3 fw-bold text-dark text-center mb-4 d-flex align-items-center justify-content-center">
              <FaUserCircle className="me-2" /> Editar Perfil
            </h1>
            <form onSubmit={handleSubmit}>
              {/* Sección de la foto de perfil */}
              <div className="d-flex flex-column align-items-center mb-4">
                <div
                  className="position-relative d-inline-block"
                  style={{ width: '120px', height: '120px' }}
                >
                  <FaUserCircle className="text-secondary bg-light rounded-circle" style={{ width: '100%', height: '100%' }} />
                  <label
                    htmlFor="avatar-upload"
                    className="position-absolute bottom-0 end-0 btn btn-sm btn-primary rounded-circle p-2"
                    style={{ transform: 'translate(25%, 25%)' }}
                  >
                    <FaCamera />
                    <input
                      type="file"
                      id="avatar-upload"
                      name="avatar"
                      accept="image/*"
                      className="d-none"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              {/* Campos del formulario */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label fw-semibold">Nombre</label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="bio" className="form-label fw-semibold">Biografía</label>
                <textarea
                  className="form-control rounded-3"
                  id="bio"
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="btn btn-outline-secondary rounded-pill px-4"
                >
                  <FaArrowLeft className="me-1" /> Volver
                </button>
                <button type="submit" className="btn btn-primary rounded-pill px-4">
                  <FaSave className="me-1" /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
