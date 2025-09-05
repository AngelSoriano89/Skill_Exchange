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
      await api.post('/exchanges/request', {
        recipientId: recipient._id,
        skills_to_offer,
        skills_to_learn,
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
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body text-center pt-0">
            <h3 className="h5 fw-semibold mb-3">
              Solicitar Intercambio a {recipient.name}
            </h3>
            {success ? (
              <div className="text-center text-success">
                <p>¡Solicitud enviada con éxito!</p>
                <button
                  onClick={onClose}
                  className="btn btn-success rounded-pill mt-4 px-4"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Mensaje */}
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">
                    Mensaje
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                {/* Habilidades que ofreces */}
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">
                    Habilidades que ofreces
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Ej. 'Inglés, Cocina'"
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
                    placeholder="Ej. 'Música, Jardinería'"
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
