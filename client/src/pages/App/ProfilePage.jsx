import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaEdit, FaPlus, FaLaptopCode, FaBookReader } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/profile/${id}`);
        setUserProfile(res.data);
      } catch (err) {
        console.error('Error al obtener el perfil:', err);
        setError('No se pudo cargar el perfil de usuario. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="alert alert-danger text-center mt-5">
        {error || 'Perfil no encontrado.'}
      </div>
    );
  }

  const isMyProfile = user && user.id === id;

  return (
    <div className="d-flex flex-column align-items-center bg-light w-100 p-4 min-vh-100">
      <div className="container py-5">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-4 p-md-5">
            {/* Encabezado del Perfil */}
            <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start mb-4">
              <div 
                className="bg-light rounded-circle me-sm-4 mb-3 mb-sm-0 d-flex justify-content-center align-items-center"
                style={{ width: '120px', height: '120px' }}
              >
                <FaUserCircle size={100} className="text-secondary" />
              </div>
              <div className="text-center text-sm-start flex-grow-1">
                <h1 className="display-5 fw-bold text-dark">
                  {userProfile.name}
                </h1>
                <p className="lead text-muted mb-3">
                  {userProfile.bio || 'Sin biografía.'}
                </p>
                {/* Botones de acción solo si es mi perfil */}
                {isMyProfile && (
                  <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-sm-start">
                    <button
                      onClick={() => navigate('/profile/edit')}
                      className="btn btn-outline-primary btn-sm rounded-pill px-4"
                    >
                      <FaEdit className="me-2" /> Editar Perfil
                    </button>
                    <button
                      onClick={() => navigate('/skills/add')}
                      className="btn btn-primary btn-sm rounded-pill px-4"
                    >
                      <FaPlus className="me-2" /> Añadir Habilidad
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* /Encabezado del Perfil */}

            <hr className="my-4" />

            {/* Habilidades */}
            <div className="row g-4">
              {/* Habilidades que Ofrece */}
              <div className="col-12 col-md-6">
                <h2 className="h5 fw-bold text-dark mb-3 d-flex align-items-center">
                  <FaLaptopCode className="me-2 text-primary" /> Ofrece
                </h2>
                <div className="d-flex flex-wrap gap-2">
                  {userProfile.skills_to_offer && userProfile.skills_to_offer.length > 0 ? (
                    userProfile.skills_to_offer.map((skill, index) => (
                      <span
                        key={index}
                        className="badge bg-primary text-wrap rounded-pill px-3 py-2 fw-normal"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted small">Aún no ofrece habilidades.</p>
                  )}
                </div>
              </div>
              {/* Habilidades que Quiere Aprender */}
              <div className="col-12 col-md-6">
                <h2 className="h5 fw-bold text-dark mb-3 d-flex align-items-center">
                  <FaBookReader className="me-2 text-success" /> Quiere Aprender
                </h2>
                <div className="d-flex flex-wrap gap-2">
                  {userProfile.skills_to_learn && userProfile.skills_to_learn.length > 0 ? (
                    userProfile.skills_to_learn.map((skill, index) => (
                      <span
                        key={index}
                        className="badge bg-success text-wrap rounded-pill px-3 py-2 fw-normal"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted small">Aún no quiere aprender habilidades.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

