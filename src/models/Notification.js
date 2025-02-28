const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, default: "Nuevo mensaje" },
  status: { type: String, enum: ["sin leer", "visto"], default: "sin leer" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

module.exports = mongoose.model("Notification", NotificationSchema);
