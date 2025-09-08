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
    let exchange = await Exchange.findById(req.params.id)
      .populate('sender', 'name email phone')
      .populate('recipient', 'name email phone');

    if (!exchange) {
      return res.status(404).json({ msg: 'Solicitud de intercambio no encontrada' });
    }

    // Asegurarse de que solo el destinatario puede aceptar la solicitud
    if (exchange.recipient._id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado para aceptar esta solicitud' });
    }

    exchange.status = 'accepted';
    
    // Desbloquear información de contacto
    exchange.contactInfo.isUnlocked = true;
    exchange.contactInfo.unlockedAt = new Date();
    
    // Guardar información de contacto de ambos usuarios
    exchange.contactInfo.senderContactInfo = {
      email: exchange.sender.email,
      phone: exchange.sender.phone || ''
    };
    
    exchange.contactInfo.recipientContactInfo = {
      email: exchange.recipient.email,
      phone: exchange.recipient.phone || ''
    };
    
    await exchange.save();
    
    // Recargar con la información actualizada
    exchange = await Exchange.findById(req.params.id)
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar');
      
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

// @route   GET api/exchanges/contact/:id
// @desc    Obtener información de contacto de un intercambio aceptado
// @access  Private
exports.getContactInfo = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id)
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar');

    if (!exchange) {
      return res.status(404).json({ msg: 'Intercambio no encontrado' });
    }

    // Verificar que el usuario es parte del intercambio
    if (
      exchange.sender._id.toString() !== req.user.id &&
      exchange.recipient._id.toString() !== req.user.id
    ) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    // Verificar que el intercambio fue aceptado
    if (exchange.status !== 'accepted' && exchange.status !== 'completed') {
      return res.status(400).json({ msg: 'La información de contacto solo está disponible para intercambios aceptados' });
    }

    // Verificar que la información de contacto fue desbloqueada
    if (!exchange.contactInfo.isUnlocked) {
      return res.status(400).json({ msg: 'Información de contacto no disponible' });
    }

    // Devolver la información de contacto del otro usuario
    const isUserSender = exchange.sender._id.toString() === req.user.id;
    const contactInfo = isUserSender 
      ? exchange.contactInfo.recipientContactInfo
      : exchange.contactInfo.senderContactInfo;
    
    const otherUser = isUserSender ? exchange.recipient : exchange.sender;

    res.json({
      user: {
        name: otherUser.name,
        email: contactInfo.email,
        phone: contactInfo.phone,
        avatar: otherUser.avatar
      },
      unlockedAt: exchange.contactInfo.unlockedAt
    });
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
