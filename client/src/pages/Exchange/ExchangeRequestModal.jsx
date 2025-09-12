import React, { useState } from 'react';
import { FaTimes, FaEnvelope, FaUser, FaStar } from 'react-icons/fa';
import exchangeService from '../../services/exchangeService';
import { handleApiError, showSuccessAlert, showLoadingAlert, closeLoadingAlert } from '../../utils/sweetAlert';

const ExchangeRequestModal = ({ onClose, recipientId, recipientName, skillTitle }) => {
  const [formData, setFormData] = useState({
    message: '',
    skills_to_offer: '',
    skills_to_learn: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    showLoadingAlert('Enviando solicitud...', 'Procesando tu solicitud de intercambio');
    
    try {
      const skills_to_offer_array = formData.skills_to_offer.split(',').map(skill => skill.trim()).filter(Boolean);
      const skills_to_learn_array = formData.skills_to_learn.split(',').map(skill => skill.trim()).filter(Boolean);
      
      await exchangeService.createExchangeRequest({
        recipientId,
        skills_to_offer: skills_to_offer_array,
        skills_to_learn: skills_to_learn_array,
        message: formData.message
      });
      
      closeLoadingAlert();
      showSuccessAlert('¡Solicitud enviada!', 'Se ha notificado al usuario sobre tu interés.');
      onClose();
    } catch (error) {
      closeLoadingAlert();
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          {/* Header */}
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title d-flex align-items-center">
              <i className="fas fa-paper-plane me-2"></i>
              Solicitar Intercambio con {recipient.name}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white"
              onClick={handleClose}
              disabled={loading}
            ></button>
          </div>

          <div className="modal-body p-4">
            {success ? (
              /* Vista de éxito */
              <div className="text-center py-4">
                <div className="mb-4">
                  <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                </div>
                <h4 className="text-success mb-3">¡Solicitud enviada con éxito!</h4>
                <p className="text-muted mb-4">
                  Tu solicitud de intercambio ha sido enviada a <strong>{recipient.name}</strong>. 
                  Recibirás una notificación cuando respondan.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/dashboard')}
                  >
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Ir al Dashboard
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={onClose}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              /* Formulario */
              <>
                {/* Información del destinatario */}
                <div className="row mb-4">
                  <div className="col-auto">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                         style={{ width: '60px', height: '60px', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {recipient.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="col">
                    <h6 className="mb-1 fw-bold">{recipient.name}</h6>
                    <p className="text-muted small mb-2">{recipient.email}</p>
                    <div className="d-flex flex-wrap gap-1">
                      {recipient.skills_to_offer && recipient.skills_to_offer.slice(0, 3).map((skill, index) => (
                        <span key={index} className="badge bg-success bg-opacity-15 text-success border border-success rounded-pill px-2 py-1">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Mensaje personalizado */}
                  <div className="mb-4">
                    <label className="form-label fw-bold text-dark">
                      <i className="fas fa-comment me-2 text-primary"></i>
                      Mensaje personalizado *
                    </label>
                    <textarea
                      className={`form-control ${error && !formData.message.trim() ? 'is-invalid' : ''}`}
                      name="message"
                      rows="4"
                      placeholder={`Hola ${recipient.name}! Me interesa intercambiar habilidades contigo. Te cuento un poco sobre mí...`}
                      value={formData.message}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                    <div className="form-text">
                      Preséntate y explica por qué te interesa este intercambio
                    </div>
                  </div>

                  {/* Habilidades que ofreces */}
                  <div className="mb-4">
                    <label className="form-label fw-bold text-dark">
                      <i className="fas fa-hand-holding me-2 text-success"></i>
                      Habilidades que puedes ofrecer *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${error && !formData.skills_to_offer.trim() ? 'is-invalid' : ''}`}
                      name="skills_to_offer"
                      placeholder="Ej: JavaScript, Desarrollo Web, React"
                      value={formData.skills_to_offer}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                    <div className="form-text">
                      Separa las habilidades con comas. Estas son las que enseñarás.
                    </div>
                  </div>

                  {/* Habilidades que quieres aprender */}
                  <div className="mb-4">
                    <label className="form-label fw-bold text-dark">
                      <i className="fas fa-graduation-cap me-2 text-info"></i>
                      Habilidades que quieres aprender *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${error && !formData.skills_to_learn.trim() ? 'is-invalid' : ''}`}
                      name="skills_to_learn"
                      placeholder="Ej: Piano, Cocina italiana, Fotografía"
                      value={formData.skills_to_learn}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                    <div className="form-text">
                      Separa las habilidades con comas. Estas son las que aprenderás.
                    </div>
                  </div>

                  {/* Sugerencia automática basada en el perfil */}
                  {(recipient.skills_to_offer?.length > 0 || user?.skills_to_offer?.length > 0) && (
                    <div className="alert alert-info" role="alert">
                      <h6 className="alert-heading">
                        <i className="fas fa-lightbulb me-2"></i>
                        Sugerencias basadas en los perfiles:
                      </h6>
                      {recipient.skills_to_offer?.length > 0 && (
                        <p className="mb-1">
                          <strong>Podrías aprender:</strong> {recipient.skills_to_offer.join(', ')}
                        </p>
                      )}
                      {user?.skills_to_offer?.length > 0 && (
                        <p className="mb-0">
                          <strong>Podrías ofrecer:</strong> {user.skills_to_offer.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </form>
              </>
            )}
          </div>

          {!success && (
            <div className="modal-footer bg-light">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleClose}
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
                    Enviando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane me-2"></i>
                    Enviar Solicitud
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExchangeRequestModal;
