import React, { useState } from 'react';
import { FaTimes, FaEnvelope } from 'react-icons/fa';
import api from '../../api/api';

const ExchangeRequestModal = ({ onClose, recipient }) => {
  const [message, setMessage] = useState('');
  const [skills_to_offer, setSkillsToOffer] = useState([]);
  const [skills_to_learn, setSkillsToLearn] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filtrar habilidades vacías para evitar enviar strings en blanco
      const offeredSkills = skills_to_offer.filter(skill => skill.trim() !== '');
      const learnedSkills = skills_to_learn.filter(skill => skill.trim() !== '');

      await api.post('/exchanges/request', {
        recipientId: recipient._id,
        skills_to_offer: offeredSkills,
        skills_to_learn: learnedSkills,
        message,
      });
      setSuccess(true);
      setError(null);
    } catch (err) {
      setError('Error al enviar la solicitud. Intenta de nuevo.');
      console.error(err);
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
