const Exchange = require('../models/Exchange');

// @route   POST api/exchanges/request
// @desc    Crear una nueva solicitud de intercambio
// @access  Private
exports.createExchangeRequest = async (req, res) => {
  const { recipientId, skills_to_offer, skills_to_learn, message } = req.body;

  try {
    const newExchange = new Exchange({
      sender: req.user.id,
      recipient: recipientId,
      skills_to_offer,
      skills_to_learn,
      message,
      status: 'pending',
    });

    await newExchange.save();
    res.json(newExchange);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/exchanges/my-requests
// @desc    Obtener solicitudes de intercambio enviadas y recibidas del usuario actual
// @access  Private
exports.getMyExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }],
    })
      .populate('sender', 'name email')
      .populate('recipient', 'name email');
    res.json(exchanges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};
