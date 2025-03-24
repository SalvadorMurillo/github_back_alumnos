// backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Obtener el token directamente del encabezado Authorization
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "Acceso denegado, token no proporcionado" });
  }

  try {
    // Verificar el token directamente sin dividirlo
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar los datos del usuario al objeto req para uso posterior
    req.user = {
      id: verified.id,
      name: verified.name,  // Ahora el usuario tendrá su nombre
      email: verified.email // Ahora el usuario tendrá su correo
    };

    next();
  } catch (err) {
    res.status(400).json({ message: "Token no válido" });
  }
};

module.exports = authMiddleware;