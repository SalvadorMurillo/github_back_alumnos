const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  recipientEmail: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ["no visto", "visto"], default: "no visto" }, // ✅ Nuevo estado del mensaje
  sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", MessageSchema);