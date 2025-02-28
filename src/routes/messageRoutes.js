const express = require("express");
const { sendMessage, getUserMessages } = require("../controllers/messageController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/send", authMiddleware, sendMessage);
router.get("/user", authMiddleware, getUserMessages);

module.exports = router;
