import React, { useState, useContext, useEffect } from 'react';
import { FaSave, FaArrowLeft, FaCamera } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
  });
  const [avatar, setAvatar] = useState(null); // Estado para el archivo de la imagen
  const [avatarPreview, setAvatarPreview] = useState(null); // Estado para la URL de vista previa

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const res = await api.get(`/profile/${user.id}`);
          const { name, bio, avatar: userAvatar } = res.data;
          setFormData({ name, bio });
          if (userAvatar) {
            setAvatarPreview(`http://localhost:5000/${userAvatar}`); // Usa la URL completa del avatar
          }
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
    const file = e.target.files[0];
    setAvatar(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Creación de FormData para enviar archivos y texto juntos
    const data = new FormData();
    data.append('name', formData.name);
    data.append('bio', formData.bio);
    if (avatar) {
      data.append('avatar', avatar); // 'avatar' debe coincidir con el nombre de campo en multer
    }

    try {
      // Envía la solicitud con el objeto FormData
      const res = await api.put(`/profile/${user.id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data', // Asegúrate de que el encabezado sea correcto
        },
      });
      console.log('Perfil actualizado:', res.data);
      alert('¡Perfil actualizado con éxito!');
      navigate(`/profile/${user.id}`);
    } catch (err) {
      console.error('Error al actualizar el perfil:', err.response?.data?.msg || err.message);
      alert('Hubo un error al guardar los cambios. Intenta de nuevo.');
    }
  };

  return (
    <div className="d-flex flex-column align-items-center bg-light w-100 p-4 min-vh-100">
      <div className="container py-5">
        <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '600px', margin: 'auto' }}>
          <div className="card-body p-4 p-md-5">
            <h1 className="h4 fw-bold text-center mb-4">Editar Perfil</h1>
            <form onSubmit={handleSubmit}>
              {/* Sección de la foto de perfil */}
              <div className="d-flex flex-column align-items-center mb-4">
                <div
                  className="position-relative d-flex justify-content-center align-items-center bg-light rounded-circle"
                  style={{ width: '128px', height: '128px', overflow: 'hidden' }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar de perfil"
                      className="img-fluid rounded-circle"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  ) : (
                    <div
                      className="bg-secondary bg-opacity-25 text-dark d-flex align-items-center justify-content-center fw-bold rounded-circle"
                      style={{ width: '128px', height: '128px', fontSize: '3rem' }}
                    >
                      {formData.name ? formData.name.charAt(0).toUpperCase() : 'N/A'}
                    </div>
                  )}
                  <label
                    htmlFor="avatarInput"
                    className="position-absolute bottom-0 end-0 p-2 bg-primary rounded-circle text-white shadow-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <FaCamera />
                  </label>
                  <input
                    type="file"
                    id="avatarInput"
                    name="avatar"
                    className="d-none"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
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
