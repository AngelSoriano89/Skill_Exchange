import React, { useState, useContext } from 'react';
import { FaPlus, FaSave, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api'; // Asegúrate de que esta ruta sea correcta

const AddSkillPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    skill: '',
    type: 'offer',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Enviar la nueva habilidad a la API sin el ID de usuario en la URL
      await api.post('/skills', formData); 
      alert('¡Habilidad añadida con éxito!');
      navigate(`/profile/${user.id}`); // Redirigir al perfil después de añadir
    } catch (err) {
      console.error('Error al añadir la habilidad:', err);
      alert('Hubo un error al guardar la habilidad.');
    }
  };

  return (
    <div className="d-flex flex-column align-items-center bg-light w-100 p-4 min-vh-100">
      <div className="container py-5">
        <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '500px', margin: 'auto' }}>
          <div className="card-body p-4 p-md-5">
            <h1 className="h3 fw-bold text-dark text-center mb-4 d-flex align-items-center justify-content-center">
              <FaPlus className="me-2" /> Añadir Habilidad
            </h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="skill" className="form-label fw-semibold">Nombre de la Habilidad</label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  id="skill"
                  name="skill"
                  value={formData.skill}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="type" className="form-label fw-semibold">Tipo de Habilidad</label>
                <select
                  className="form-select rounded-pill"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="offer">Ofrezco esta habilidad</option>
                  <option value="learn">Quiero aprender esta habilidad</option>
                </select>
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
                  <FaSave className="me-1" /> Guardar Habilidad
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
