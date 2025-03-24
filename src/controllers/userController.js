// backend/src/controllers/userController.js
const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/crypto");
const jwt = require("jsonwebtoken");

// Registro de usuario
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "El usuario ya existe" });
    
    const hashedPassword = await hashPassword(password);
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Login de usuario
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Credenciales incorrectas" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Credenciales incorrectas" });

    // 🔥 Ahora el token también incluye el nombre y el email del usuario
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};


// Obtener todos los usuarios (requiere autenticación)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = { registerUser, loginUser, getUsers };