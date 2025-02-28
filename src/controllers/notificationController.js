const Notification = require("../models/Notification");

const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Obtener el ID del usuario autenticado

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    // Verificar si la notificación pertenece al usuario autenticado
    if (notification.userId.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para marcar esta notificación como vista" });
    }

    notification.status = "visto";
    notification.updatedAt = new Date();
    await notification.save();

    res.json({ message: "Notificación marcada como vista" });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = { getUserNotifications, markNotificationAsRead };
