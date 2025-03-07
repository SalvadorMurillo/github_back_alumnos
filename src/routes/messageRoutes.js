const express = require("express");
const { sendMessage, getUserMessages, markMessageAsRead, getSentMessages } = require("../controllers/messageController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/send", authMiddleware, sendMessage);
router.get("/user", authMiddleware, getUserMessages);
router.get("/sent", authMiddleware, getSentMessages); // ✅ Nueva ruta para mensajes enviados
router.put("/:id/read", authMiddleware, markMessageAsRead); // ✅ Ruta para marcar como visto

module.exports = router;
