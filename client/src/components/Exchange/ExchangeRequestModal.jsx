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
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div className="modal-content rounded-4 shadow-lg border-0">
          <div className="modal-header bg-primary text-white rounded-top-4 border-0">
            <h5 className="modal-title fw-bold d-flex align-items-center">
              <FaEnvelope className="me-2" />
              Solicitar Intercambio
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              aria-label="Close" 
              onClick={onClose}
              disabled={isLoading}
            ></button>
          </div>
          
          <div className="modal-body p-4">
            {/* Información del destinatario */}
            <div className="card bg-light border-0 mb-4">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <FaUser className="text-primary me-3" size={20} />
                  <div>
                    <h6 className="fw-bold mb-1">Enviar solicitud a: {recipientName}</h6>
                    {skillTitle && (
                      <small className="text-muted">Interesado en: {skillTitle}</small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Mensaje personalizado */}
              <div className="mb-4">
                <label htmlFor="message" className="form-label fw-semibold">
                  Mensaje personal <small className="text-muted">(opcional)</small>
                </label>
                <textarea
                  className="form-control"
                  id="message"
                  name="message"
                  rows="3"
                  placeholder="Escribe un mensaje personalizado para presentarte y explicar por qué te interesa este intercambio..."
                  value={formData.message}
                  onChange={handleChange}
                  maxLength="500"
                />
                <small className="text-muted">{formData.message.length}/500 caracteres</small>
              </div>

              <div className="row">
                {/* Habilidades que ofreces */}
                <div className="col-md-6 mb-4">
                  <label htmlFor="skills_to_offer" className="form-label fw-semibold">
                    🎁 Habilidades que ofreces *
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="skills_to_offer"
                    name="skills_to_offer"
                    placeholder="Ej: Desarrollo Web, Diseño"
                    value={formData.skills_to_offer}
                    onChange={handleChange}
                    required
                  />
                  <small className="text-muted">Separa con comas las habilidades que puedes enseñar</small>
                </div>

                {/* Habilidades que quieres aprender */}
                <div className="col-md-6 mb-4">
                  <label htmlFor="skills_to_learn" className="form-label fw-semibold">
                    🎯 Habilidades que quieres aprender *
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="skills_to_learn"
                    name="skills_to_learn"
                    placeholder="Ej: Música, Fotografía"
                    value={formData.skills_to_learn}
                    onChange={handleChange}
                    required
                  />
                  <small className="text-muted">Separa con comas las habilidades que quieres aprender</small>
                </div>
              </div>

              {/* Información adicional */}
              <div className="alert alert-info border-0 bg-info bg-opacity-10">
                <small className="text-info">
                  <strong>Consejo:</strong> Sé específico sobre qué puedes enseñar y qué quieres aprender. 
                  Esto ayudará al otro usuario a entender mejor tu propuesta.
                </small>
              </div>
            </form>
          </div>

          <div className="modal-footer border-0 pt-0">
            <div className="d-flex gap-2 w-100">
              <button
                type="button"
                className="btn btn-outline-secondary flex-fill"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-fill"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <FaEnvelope className="me-2" />
                    Enviar Solicitud
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRequestModal;
