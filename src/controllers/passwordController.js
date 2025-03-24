const User = require("../models/User");
const crypto = require("crypto");
const { hashPassword } = require("../utils/crypto");
const emailjs = require('@emailjs/nodejs');

// Configuración de EmailJS (usa tus credenciales)
const emailjsConfig = {
  serviceID: 'service_zutp2rb',
  templateID: 'template_lxzvxmp',
  userID: 'pJmNDOpZbgOPJ9wZ_',
  accessToken: 'sxJ0jBX9dB_vAKOXIaD3M'
};

const generateResetCode = () => {
  // Genera un código de 6 dígitos numéricos
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Endpoint 1: Solicitar código (solo email)
const sendResetCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email es requerido" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const resetCode = generateResetCode();
    const resetExpires = new Date(Date.now() + 600000); // 10 minutos

    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Enviar email con EmailJS
    await emailjs.send(
        emailjsConfig.serviceID,
        emailjsConfig.templateID,
        {
          email_password_perdido: user.email,  // Mapeado al campo en tu plantilla
          emailjs_code: resetCode             // Mapeado al campo en tu plantilla
        },
        {
          publicKey: emailjsConfig.userID,
          privateKey: emailjsConfig.accessToken
        }
      );      

    res.json({ 
      success: true,
      message: "Código enviado al correo electrónico",
      expiresIn: "10 minutos"
    });

  } catch (error) {
    console.error("Error en sendResetCode:", error);
    res.status(500).json({ message: "Error al enviar el código" });
  }
};

// Endpoint 2: Validar código y cambiar contraseña
const validateAndReset = async (req, res) => {
  const { code, newPassword } = req.body;

  if (!code || !newPassword) {
    return res.status(400).json({ 
      message: "Código y nueva contraseña son requeridos" 
    });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Código inválido o expirado" 
      });
    }

    // Actualizar contraseña
    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ 
      success: true,
      message: "Contraseña actualizada correctamente" 
    });

  } catch (error) {
    console.error("Error en validateAndReset:", error);
    res.status(500).json({ message: "Error al actualizar contraseña" });
  }
};

module.exports = { sendResetCode, validateAndReset };