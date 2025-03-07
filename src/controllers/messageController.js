const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");

const sendMessage = async (req, res) => {
  try {
    const { recipientEmail, content } = req.body;
    const senderId = req.user.id;

    // Buscar al remitente en la base de datos
    const sender = await User.findById(senderId);
    if (!sender) return res.status(404).json({ message: "Usuario no encontrado" });

    // Buscar al destinatario en la base de datos
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) return res.status(404).json({ message: "El destinatario no existe" });

    // Crear y guardar el mensaje
    const newMessage = new Message({
      senderId,
      senderName: sender.name,
      senderEmail: sender.email,
      recipientEmail,
      content
    });
    await newMessage.save();

    // Crear la notificación para el destinatario
    const newNotification = new Notification({ userId: recipient._id });
    await newNotification.save();

    res.status(201).json({ message: "Mensaje enviado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

const getUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener la información del usuario desde la base de datos
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const userEmail = user.email;
    // console.log("Buscando mensajes para:", userEmail); // 🔍 Depuración

    const messages = await Message.find({ recipientEmail: userEmail });
    // console.log("Mensajes encontrados:", messages); // 🔍 Depuración

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del mensaje
    const userId = req.user.id; // Obtener el ID del usuario autenticado

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: "Mensaje no encontrado" });
    }

    // Verificar que el usuario autenticado es el destinatario del mensaje
    const user = await User.findById(userId);
    if (!user || user.email !== message.recipientEmail) {
      return res.status(403).json({ message: "No tienes permiso para actualizar este mensaje" });
    }

    // Marcar como "visto"
    message.status = "visto";
    await message.save();

    res.json({ message: "Mensaje marcado como visto" });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

const getSentMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener la información del usuario desde la base de datos
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Buscar los mensajes enviados por el usuario autenticado
    const messages = await Message.find({ senderEmail: user.email });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};





module.exports = { sendMessage, getUserMessages, markMessageAsRead, getSentMessages };
