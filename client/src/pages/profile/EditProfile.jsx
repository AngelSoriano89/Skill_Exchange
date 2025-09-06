import React, { useState, useContext, useEffect } from 'react';
import { FaUserCircle, FaSave, FaArrowLeft } from 'react-icons/fa';
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
          // Opcional: Manejar el error, como redirigir a la página de inicio
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Enviar los datos actualizados a la API
      await api.put(`/profile/${user.id}`, formData);
      alert('¡Perfil actualizado con éxito!');
      navigate(`/profile/${user.id}`); // Redirigir al perfil actualizado
    } catch (err) {
      console.error('Error al actualizar el perfil:', err);
      alert('Hubo un error al guardar los cambios.');
    }
  };

  return (
    <div className="d-flex flex-column align-items-center bg-light w-100 p-4 min-vh-100">
      <div className="container py-5">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-4 p-md-5">
            <h1 className="h2 fw-bold text-center text-dark mb-4">
              <FaUserCircle className="me-2" /> Editar Perfil
            </h1>
            <form onSubmit={handleSubmit}>
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