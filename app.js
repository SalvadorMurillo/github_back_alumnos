const express = require("express");
const cors = require("cors");
const userRoutes = require("./src/routes/userRoutes");
const messageRoutes = require("./src/routes/messageRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");

const app = express();

// Configuración de CORS para permitir el frontend en Netlify
const corsOptions = {
  origin: ["https://67c7e52514c11c70b5a8d34b--alumnos8b.netlify.app"], // URL del frontend
  credentials: true, // Permitir cookies/tokens en headers
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

module.exports = app;