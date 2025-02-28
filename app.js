const express = require("express");
const cors = require("cors");
const userRoutes = require("./src/routes/userRoutes");
const messageRoutes = require("./src/routes/messageRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes); // Asegúrate de que esta línea esté
app.use("/api/notifications", notificationRoutes);

module.exports = app;