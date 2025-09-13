const Exchange = require('../models/Exchange');

// @route   POST api/exchanges/request
// @desc    Crear una nueva solicitud de intercambio
// @access  Private
exports.createExchangeRequest = async (req, res) => {
  const { recipientId, skills_to_offer, skills_to_learn, message } = req.body;

  try {
    // Verificar que no se envíe solicitud a sí mismo
    if (recipientId === req.user.id) {
      return res.status(400).json({ msg: 'No puedes enviarte una solicitud a ti mismo' });
    }

    // Verificar si ya existe una solicitud pendiente entre estos usuarios
    const existingRequest = await Exchange.findOne({
      sender: req.user.id,
      recipient: recipientId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ msg: 'Ya tienes una solicitud pendiente con este usuario' });
    }

    const newExchange = new Exchange({
      sender: req.user.id,
      recipient: recipientId,
      skills_to_offer,
      skills_to_learn,
      message,
      status: 'pending',
    });

    await newExchange.save();
    
    // Poblar los datos del sender y recipient
    await newExchange.populate('sender', 'name email');
    await newExchange.populate('recipient', 'name email');
    
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
      .populate('sender', 'name email skills_to_offer skills_to_learn')
      .populate('recipient', 'name email skills_to_offer skills_to_learn')
      .sort({ date: -1 });
      
    res.json(exchanges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/exchanges/pending
// @desc    Obtener solicitudes de intercambio pendientes para el usuario actual (como recipient)
// @access  Private
exports.getPendingRequests = async (req, res) => {
  try {
    const exchanges = await Exchange.find({
      recipient: req.user.id,
      status: 'pending'
    })
      .populate('sender', 'name email skills_to_offer skills_to_learn')
      .populate('recipient', 'name email')
      .sort({ date: -1 });
      
    res.json(exchanges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   PUT api/exchanges/accept/:id
// @desc    Aceptar una solicitud de intercambio
// @access  Private
exports.acceptExchangeRequest = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id);
    
    if (!exchange) {
      return res.status(404).json({ msg: 'Intercambio no encontrado' });
    }
    
    // Verificar que el usuario actual es el recipient
    if (exchange.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No tienes autorización para aceptar esta solicitud' });
    }
    
    // Verificar que la solicitud esté pendiente
    if (exchange.status !== 'pending') {
      return res.status(400).json({ msg: 'Esta solicitud ya no está pendiente' });
    }
    
    exchange.status = 'accepted';
    await exchange.save();
    
    // Poblar los datos antes de enviar la respuesta
    await exchange.populate('sender', 'name email');
    await exchange.populate('recipient', 'name email');
    
    res.json(exchange);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   PUT api/exchanges/reject/:id
// @desc    Rechazar una solicitud de intercambio
// @access  Private
exports.rejectExchangeRequest = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id);
    
    if (!exchange) {
      return res.status(404).json({ msg: 'Intercambio no encontrado' });
    }
    
    // Verificar que el usuario actual es el recipient
    if (exchange.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No tienes autorización para rechazar esta solicitud' });
    }
    
    // Verificar que la solicitud esté pendiente
    if (exchange.status !== 'pending') {
      return res.status(400).json({ msg: 'Esta solicitud ya no está pendiente' });
    }
    
    exchange.status = 'rejected';
    await exchange.save();
    
    // Poblar los datos antes de enviar la respuesta
    await exchange.populate('sender', 'name email');
    await exchange.populate('recipient', 'name email');
    
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
    const exchange = await Exchange.findById(req.params.id);
    
    if (!exchange) {
      return res.status(404).json({ msg: 'Intercambio no encontrado' });
    }
    
    // Verificar que el usuario actual es parte del intercambio
    if (exchange.sender.toString() !== req.user.id && exchange.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No tienes autorización para completar este intercambio' });
    }
    
    // Verificar que el intercambio esté aceptado
    if (exchange.status !== 'accepted') {
      return res.status(400).json({ msg: 'Este intercambio no está en estado aceptado' });
    }
    
    exchange.status = 'completed';
    await exchange.save();
    
    // Poblar los datos antes de enviar la respuesta
    await exchange.populate('sender', 'name email');
    await exchange.populate('recipient', 'name email');
    
    res.json(exchange);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/exchanges/:id
// @desc    Obtener un intercambio específico por ID
// @access  Private
exports.getExchangeById = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id)
      .populate('sender', 'name email phone skills_to_offer skills_to_learn')
      .populate('recipient', 'name email phone skills_to_offer skills_to_learn');
    
    if (!exchange) {
      return res.status(404).json({ msg: 'Intercambio no encontrado' });
    }
    
    // Verificar que el usuario actual es parte del intercambio
    if (exchange.sender._id.toString() !== req.user.id && exchange.recipient._id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No tienes autorización para ver este intercambio' });
    }
    
    res.json(exchange);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};
