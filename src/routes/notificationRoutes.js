const express = require("express");
const { getUserNotifications, markNotificationAsRead } = require("../controllers/notificationController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/user", authMiddleware, getUserNotifications);
router.put("/:id", authMiddleware, markNotificationAsRead);

module.exports = router;
