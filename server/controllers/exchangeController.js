const Exchange = require('../models/Exchange');
const User = require('../models/User');
const mongoose = require('mongoose'); // ✅ AGREGADO: Import mongoose

// @route   POST api/exchanges/request
// @desc    Crear una nueva solicitud de intercambio
// @access  Private
exports.createExchangeRequest = async (req, res) => {
  const { recipientId, skills_to_offer, skills_to_learn, message, skillId } = req.body;

  try {
    // ✅ MEJORADO: Validaciones más robustas
    if (!recipientId || !skills_to_offer || !skills_to_learn || !message) {
      return res.status(400).json({ 
        msg: 'Todos los campos son requeridos',
        required: ['recipientId', 'skills_to_offer', 'skills_to_learn', 'message']
      });
    }

    // Verificar que no se envíe solicitud a sí mismo
    if (recipientId === req.user.id) {
      return res.status(400).json({ msg: 'No puedes enviarte una solicitud a ti mismo' });
    }

    // ✅ AGREGADO: Verificar que el recipient existe
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ msg: 'El usuario destinatario no existe' });
    }

    // ✅ AGREGADO: Verificar que el recipient está activo
    if (!recipient.isActive) {
      return res.status(400).json({ msg: 'El usuario no está disponible para intercambios' });
    }

    // Convertir IDs a ObjectId para evitar discrepancias de tipos
    const senderObjectId = new mongoose.Types.ObjectId(req.user.id);
    const recipientObjectId = new mongoose.Types.ObjectId(recipientId);

    // Verificar si ya existe una solicitud pendiente entre estos usuarios
    const existingRequest = await Exchange.findOne({
      $or: [
        { sender: senderObjectId, recipient: recipientObjectId, status: 'pending' },
        { sender: recipientObjectId, recipient: senderObjectId, status: 'pending' }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ 
        msg: 'Ya existe una solicitud pendiente entre ustedes',
        exchangeId: existingRequest._id
      });
    }

    // ✅ AGREGADO: Validar arrays de habilidades
    const skillsToOffer = Array.isArray(skills_to_offer) ? skills_to_offer : [skills_to_offer];
    const skillsToLearn = Array.isArray(skills_to_learn) ? skills_to_learn : [skills_to_learn];

    if (skillsToOffer.length === 0 || skillsToLearn.length === 0) {
      return res.status(400).json({ msg: 'Debe especificar al menos una habilidad para ofrecer y una para aprender' });
    }

    // ✅ AGREGADO: Limpiar y validar habilidades
    const cleanSkillsToOffer = skillsToOffer
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .slice(0, 10); // Máximo 10 habilidades

    const cleanSkillsToLearn = skillsToLearn
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .slice(0, 10); // Máximo 10 habilidades

    // ✅ AGREGADO: Obtener metadatos de la petición
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress || '',
      userAgent: req.get('User-Agent') || '',
      source: req.get('X-Client-Type') || 'web'
    };

    const newExchange = new Exchange({
      sender: senderObjectId,
      recipient: recipientObjectId,
      skills_to_offer: cleanSkillsToOffer,
      skills_to_learn: cleanSkillsToLearn,
      message: message.trim(),
      status: 'pending',
      skill: skillId || null, // Referencia opcional a skill específica
      metadata
    });

    await newExchange.save();
    
        // ✅ OPTIMIZADO: Poblar en una sola operación
    await newExchange.populate([
      { path: 'sender', select: 'name email avatar' },
      { path: 'recipient', select: 'name email avatar' }
    ]);
    
    // ✅ PREVENIR: Eliminar virtuals problemáticas que puedan causar errores
    const responseData = newExchange.toObject();
    delete responseData.duration; // Evita el error 'toFixed' de undefined
    
    res.status(201).json(responseData);
  } catch (err) {
    console.error('Error creating exchange request:', err.message);
    
    // ✅ MEJORADO: Manejo específico de errores de validación
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        msg: 'Errores de validación', 
        errors 
      });
    }
    
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// @route   GET api/exchanges/my-requests
// @desc    Obtener solicitudes de intercambio enviadas y recibidas del usuario actual
// @access  Private
exports.getMyExchanges = async (req, res) => {
  try {
    // Verificar si el modelo Skill está registrado
    const Skill = mongoose.models.Skill || mongoose.model('Skill', require('../models/Skill').schema);
    
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    // Obtener intercambios donde el usuario es el remitente o el destinatario
    let exchanges = await Exchange.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    })
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .populate({
        path: 'skill',
        select: 'title category level',
        model: Skill // Referencia explícita al modelo
      })
      .sort({ date: -1 })
      .lean();
    
    res.json(exchanges);
  } catch (err) {
    console.error('Error getting exchanges:', err.message);
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @route   GET api/exchanges/pending
// @desc    Obtener solicitudes de intercambio pendientes para el usuario actual (como recipient)
// @access  Private
exports.getPendingRequests = async (req, res) => {
  try {
    // Verificar si el modelo Skill está registrado
    const Skill = mongoose.models.Skill || mongoose.model('Skill', require('../models/Skill').schema);
    
    // ✅ OPTIMIZACIÓN: Usar lean() para mejor rendimiento
    let exchanges = await Exchange.find({
      recipient: new mongoose.Types.ObjectId(req.user.id),
      status: 'pending'
    })
      .populate('sender', 'name email skills_to_offer skills_to_learn avatar averageRating totalExchanges')
      .populate('recipient', 'name email avatar')
      .populate({
        path: 'skill',
        select: 'title category level',
        model: Skill // Referencia explícita al modelo
      })
      .sort({ date: -1 })
      .lean();
    
    // ✅ SEGURIDAD: Limpiar datos sensibles y asegurar consistencia
    exchanges = exchanges.map(exchange => {
      // Eliminar virtuals problemáticas
      const { duration, ...safeExchange } = exchange;
      
      // Asegurar que las fechas sean válidas
      if (safeExchange.exchangeDetails) {
        if (safeExchange.exchangeDetails.startDate && isNaN(new Date(safeExchange.exchangeDetails.startDate).getTime())) {
          console.warn('Fecha de inicio inválida en exchange:', safeExchange._id);
          delete safeExchange.exchangeDetails.startDate;
        }
        if (safeExchange.exchangeDetails.endDate && isNaN(new Date(safeExchange.exchangeDetails.endDate).getTime())) {
          console.warn('Fecha de fin inválida en exchange:', safeExchange._id);
          delete safeExchange.exchangeDetails.endDate;
        }
      }
      
      return safeExchange;
    });
    
    res.json(exchanges);
  } catch (err) {
    console.error('Error getting pending requests:', err.message);
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @route   PUT api/exchanges/accept/:id
// @desc    Aceptar una solicitud de intercambio
// @access  Private
exports.acceptExchangeRequest = async (req, res) => {
  try {
    console.log('Attempting to accept exchange:', req.params.id);
    
    const exchange = await Exchange.findById(req.params.id);
    
    if (!exchange) {
      console.log('Exchange not found:', req.params.id);
      return res.status(404).json({ msg: 'Intercambio no encontrado' });
    }
    
    console.log('Exchange found:', {
      id: exchange._id,
      status: exchange.status,
      sender: exchange.sender,
      recipient: exchange.recipient,
      currentUser: req.user.id
    });
    
    // Verificar que el usuario actual es el recipient
    if (exchange.recipient.toString() !== req.user.id) {
      console.log('Unauthorized: User is not recipient', {
        recipient: exchange.recipient.toString(),
        currentUser: req.user.id
      });
      return res.status(401).json({ msg: 'No tienes autorización para aceptar esta solicitud' });
    }
    
    // Verificar que la solicitud esté pendiente
    if (exchange.status !== 'pending') {
      console.log('Exchange is not pending:', exchange.status);
      return res.status(400).json({ 
        msg: 'Esta solicitud ya no está pendiente',
        currentStatus: exchange.status
      });
    }
    
    // ✅ CORREGIDO: Eliminar transacción que causa problemas
    console.log('Updating exchange status to accepted...');
    
    exchange.status = 'accepted';
    exchange.contactInfo.isUnlocked = true;
    exchange.contactInfo.unlockedAt = new Date();
    
    await exchange.save();
    console.log('Exchange updated successfully');
    
    // ✅ CORREGIDO: Actualizar contadores sin transacción
    try {
      await User.updateMany(
        { _id: { $in: [exchange.sender, exchange.recipient] } },
        { $inc: { totalExchanges: 1 } }
      );
      console.log('User counters updated successfully');
    } catch (counterError) {
      console.error('Error updating user counters (non-critical):', counterError.message);
      // No fallar la operación por esto
    }
    
    // ✅ OPTIMIZADO: Poblar datos después de guardar
    await exchange.populate([
      { path: 'sender', select: 'name email avatar phone' },
      { path: 'recipient', select: 'name email avatar phone' }
    ]);
    
    console.log('Exchange acceptance completed successfully');
    res.json(exchange);
  } catch (err) {
    console.error('Error accepting exchange:', err.message);
    console.error('Full error:', err);
    
    // ✅ MEJORADO: Manejo específico de errores
    if (err.kind === 'ObjectId' || err.name === 'CastError') {
      return res.status(400).json({ msg: 'ID de intercambio inválido' });
    }
    
    res.status(500).json({ 
      msg: 'Error del servidor al aceptar intercambio',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @route   PUT api/exchanges/reject/:id
// @desc    Rechazar una solicitud de intercambio
// @access  Private
exports.rejectExchangeRequest = async (req, res) => {
  try {
    const { reason } = req.body; // ✅ AGREGADO: Razón opcional del rechazo
    
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
      return res.status(400).json({ 
        msg: 'Esta solicitud ya no está pendiente',
        currentStatus: exchange.status
      });
    }
    
    exchange.status = 'rejected';
    
    // ✅ AGREGADO: Guardar razón del rechazo en notas
    if (reason && reason.trim()) {
      exchange.exchangeDetails.notes = reason.trim();
    }
    
    await exchange.save();
    
    // ✅ OPTIMIZADO: Poblar datos después de guardar
    await exchange.populate([
      { path: 'sender', select: 'name email avatar' },
      { path: 'recipient', select: 'name email avatar' }
    ]);
    
    res.json(exchange);
  } catch (err) {
    console.error('Error rejecting exchange:', err.message);
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @route   PUT api/exchanges/complete/:id
// @desc    Marcar un intercambio como completado
// @access  Private
exports.completeExchange = async (req, res) => {
  try {
    const { notes, duration } = req.body; // ✅ AGREGADO: Notas y duración opcionales
    
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
      return res.status(400).json({ 
        msg: 'Este intercambio no está en estado aceptado',
        currentStatus: exchange.status
      });
    }
    
    exchange.status = 'completed';
    exchange.exchangeDetails.endDate = new Date();
    
    // ✅ AGREGADO: Guardar notas adicionales
    if (notes && notes.trim()) {
      exchange.exchangeDetails.notes = notes.trim();
    }
    
    // ✅ AGREGADO: Guardar duración si se proporciona
    if (duration) {
      exchange.exchangeDetails.estimatedDuration = duration;
    }
    
    await exchange.save();
    
    // ✅ OPTIMIZADO: Poblar datos después de guardar
    await exchange.populate([
      { path: 'sender', select: 'name email avatar' },
      { path: 'recipient', select: 'name email avatar' }
    ]);
    
    res.json(exchange);
  } catch (err) {
    console.error('Error completing exchange:', err.message);
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @route   GET api/exchanges/:id
// @desc    Obtener un intercambio específico por ID
// @access  Private
exports.getExchangeById = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id)
      .populate('sender', 'name email phone skills_to_offer skills_to_learn avatar averageRating location experience')
      .populate('recipient', 'name email phone skills_to_offer skills_to_learn avatar averageRating location experience')
      .populate('skill', 'title description category level averageRating')
      .lean(); // ✅ OPTIMIZACIÓN: usar lean()
    
    if (!exchange) {
      return res.status(404).json({ msg: 'Intercambio no encontrado' });
    }
    
    // Verificar que el usuario actual es parte del intercambio
    if (exchange.sender._id.toString() !== req.user.id && exchange.recipient._id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No tienes autorización para ver este intercambio' });
    }
    
    // ✅ AGREGADO: Solo mostrar info de contacto si el intercambio está aceptado
    if (exchange.status !== 'accepted' && exchange.status !== 'completed') {
      // Remover información sensible para intercambios no aceptados
      if (exchange.sender._id.toString() !== req.user.id) {
        delete exchange.sender.phone;
      }
      if (exchange.recipient._id.toString() !== req.user.id) {
        delete exchange.recipient.phone;
      }
    }
    
    res.json(exchange);
  } catch (err) {
    console.error('Error getting exchange by id:', err.message);
    
    // ✅ MEJORADO: Manejo específico de ObjectId inválido
    if (err.kind === 'ObjectId' || err.name === 'CastError') {
      return res.status(404).json({ msg: 'Intercambio no encontrado' });
    }
    
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ✅ CORREGIDO: Función para obtener estadísticas de intercambios
// @route   GET api/exchanges/stats
// @desc    Obtener estadísticas de intercambios del usuario actual
// @access  Private
exports.getExchangeStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // ✅ CORREGIDO: Usar new mongoose.Types.ObjectId() en lugar de mongoose.Types.ObjectId()
    const stats = await Exchange.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { recipient: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // ✅ Formatear estadísticas
    const formattedStats = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
      total: 0
    };
    
    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });
    
    // ✅ AGREGADO: Estadísticas adicionales
    const [sentRequests, receivedRequests] = await Promise.all([
      Exchange.countDocuments({ sender: userId }),
      Exchange.countDocuments({ recipient: userId })
    ]);
    
    formattedStats.sent = sentRequests;
    formattedStats.received = receivedRequests;
    
    // ✅ AGREGADO: Estadísticas de tiempo
    const recentExchanges = await Exchange.countDocuments({
      $or: [{ sender: userId }, { recipient: userId }],
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Últimos 30 días
    });
    
    formattedStats.recent = recentExchanges;
    
    res.json(formattedStats);
  } catch (err) {
    console.error('Error getting exchange stats:', err.message);
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ✅ AGREGADO: Función para cancelar intercambio (solo sender puede cancelar pending)
// @route   DELETE api/exchanges/cancel/:id
// @desc    Cancelar una solicitud de intercambio pendiente
// @access  Private
exports.cancelExchange = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id);
    
    if (!exchange) {
      return res.status(404).json({ msg: 'Intercambio no encontrado' });
    }
    
    // Solo el sender puede cancelar y solo si está pending
    if (exchange.sender.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Solo el emisor puede cancelar la solicitud' });
    }
    
    if (exchange.status !== 'pending') {
      return res.status(400).json({ 
        msg: 'Solo se pueden cancelar solicitudes pendientes',
        currentStatus: exchange.status
      });
    }
    
    // Eliminar el intercambio en lugar de cambiar status
    await Exchange.findByIdAndDelete(req.params.id);
    
    res.json({ 
      msg: 'Solicitud cancelada exitosamente',
      deletedId: req.params.id
    });
  } catch (err) {
    console.error('Error canceling exchange:', err.message);
    
    if (err.kind === 'ObjectId' || err.name === 'CastError') {
      return res.status(404).json({ msg: 'Intercambio no encontrado' });
    }
    
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ✅ AGREGADO: Función helper para verificar si un intercambio puede ser modificado
exports.canModifyExchange = (exchange, userId, action) => {
  const userIsParticipant = exchange.sender.toString() === userId || exchange.recipient.toString() === userId;
  
  if (!userIsParticipant) {
    return { canModify: false, reason: 'No eres participante de este intercambio' };
  }

  switch (action) {
    case 'accept':
      if (exchange.recipient.toString() !== userId) {
        return { canModify: false, reason: 'Solo el destinatario puede aceptar' };
      }
      if (exchange.status !== 'pending') {
        return { canModify: false, reason: 'Solo se pueden aceptar solicitudes pendientes' };
      }
      break;

    case 'reject':
      if (exchange.recipient.toString() !== userId) {
        return { canModify: false, reason: 'Solo el destinatario puede rechazar' };
      }
      if (exchange.status !== 'pending') {
        return { canModify: false, reason: 'Solo se pueden rechazar solicitudes pendientes' };
      }
      break;

    case 'cancel':
      if (exchange.sender.toString() !== userId) {
        return { canModify: false, reason: 'Solo el emisor puede cancelar' };
      }
      if (exchange.status !== 'pending') {
        return { canModify: false, reason: 'Solo se pueden cancelar solicitudes pendientes' };
      }
      break;

    case 'complete':
      if (exchange.status !== 'accepted') {
        return { canModify: false, reason: 'Solo se pueden completar intercambios aceptados' };
      }
      break;

    default:
      return { canModify: false, reason: 'Acción no válida' };
  }

  return { canModify: true };
};
