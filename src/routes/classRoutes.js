const express = require("express");
const router = express.Router();
const { createClass, getClasses } = require("../controllers/classController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, createClass);
router.get("/", authMiddleware, getClasses);

module.exports = router;
