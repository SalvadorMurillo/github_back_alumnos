const express = require("express");
const { 
  sendResetCode, 
  validateAndReset 
} = require("../controllers/passwordController");

const router = express.Router();

// POST /api/password/send-code (solo necesita email)
router.post("/send-code", sendResetCode);

// POST /api/password/reset (necesita código + nueva contraseña)
router.post("/reset", validateAndReset);

module.exports = router;