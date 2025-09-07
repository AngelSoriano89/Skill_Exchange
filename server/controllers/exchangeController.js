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

// @route   GET api/exchanges/received
// @desc    Obtener todas las solicitudes de intercambio pendientes recibidas por el usuario
// @access  Private
exports.getReceivedExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.find({ recipient: req.user.id, status: 'pending' })
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar');
    res.json(exchanges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/exchanges/sent
// @desc    Obtener todas las solicitudes de intercambio enviadas por el usuario
// @access  Private
exports.getSentExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.find({ sender: req.user.id })
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar');
    res.json(exchanges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/exchanges/accepted
// @desc    Obtener intercambios aceptados (ya sea como sender o recipient)
// @access  Private
exports.getAcceptedExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }],
      status: 'accepted',
    })
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar');
    res.json(exchanges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/exchanges/completed
// @desc    Obtener intercambios completados (ya sea como sender o recipient)
// @access  Private
exports.getCompletedExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }],
      status: 'completed',
    })
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar');
    res.json(exchanges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};


// @route   POST api/exchanges/accept/:id
// @desc    Aceptar una solicitud de intercambio
// @access  Private
exports.acceptExchange = async (req, res) => {
  try {
    let exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ msg: 'Solicitud de intercambio no encontrada' });
    }

    // Asegurarse de que solo el destinatario puede aceptar la solicitud
    if (exchange.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado para aceptar esta solicitud' });
    }

    exchange.status = 'accepted';
    await exchange.save();
    res.json(exchange);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   POST api/exchanges/reject/:id
// @desc    Rechazar una solicitud de intercambio
// @access  Private
exports.rejectExchange = async (req, res) => {
  try {
    let exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ msg: 'Solicitud de intercambio no encontrada' });
    }

    // Asegurarse de que solo el destinatario puede rechazar la solicitud
    if (exchange.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado para rechazar esta solicitud' });
    }

    exchange.status = 'rejected';
    await exchange.save();
    res.json(exchange);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   PUT api/exchanges/complete/:id
// @desc    Marcar un intercambio como completado
// @access  Private
exports.completeExchange = async (req, res) => {
  try {
    let exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ msg: 'Intercambio no encontrado' });
    }

    // Asegurarse de que solo el sender o el recipient pueden completar el intercambio
    if (
      exchange.sender.toString() !== req.user.id &&
      exchange.recipient.toString() !== req.user.id
    ) {
      return res.status(401).json({ msg: 'No autorizado para completar este intercambio' });
    }

    // Verificar si el intercambio ya fue completado
    if (exchange.status === 'completed') {
      return res.status(400).json({ msg: 'El intercambio ya ha sido completado' });
    }

    exchange.status = 'completed';
    await exchange.save();
    res.json(exchange);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};
