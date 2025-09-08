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
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content rounded-3 shadow-lg p-3">
          <div className="modal-header border-0 pb-0 d-flex justify-content-end">
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <h5 className="modal-title text-center fw-bold mb-3">
              Enviar Solicitud a {recipient.name}
            </h5>
            {success ? (
              <div className="text-center p-4">
                <p className="fs-5 text-success">
                  ¡Solicitud enviada con éxito!
                </p>
                <button className="btn btn-primary mt-3" onClick={onClose}>
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Mensaje */}
                <div className="mb-3">
                  <label htmlFor="message" className="form-label fw-bold text-dark">
                    Mensaje (opcional)
                  </label>
                  <textarea
                    className="form-control"
                    id="message"
                    rows="3"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>
                {/* Habilidades que ofreces */}
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">
                    Habilidades que quieres ofrecer
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Ej. 'Desarrollo Web, Jardinería'"
                    value={skills_to_offer.join(', ')}
                    onChange={(e) =>
                      setSkillsToOffer(e.target.value.split(',').map((s) => s.trim()))
                    }
                    required
                  />
                </div>
                {/* Habilidades que quieres aprender */}
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">
                    Habilidades que quieres aprender
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Ej. 'Música, Fotografía'"
                    value={skills_to_learn.join(', ')}
                    onChange={(e) =>
                      setSkillsToLearn(e.target.value.split(',').map((s) => s.trim()))
                    }
                    required
                  />
                </div>
                {error && <p className="text-danger text-center small fst-italic mb-3">{error}</p>}
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary fw-bold rounded-pill"
                  >
                    <FaEnvelope className="me-2" /> Enviar Solicitud
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRequestModal;
