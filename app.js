const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./src/routes/userRoutes");
const messageRoutes = require("./src/routes/messageRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const classRoutes = require("./src/routes/classRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const passwordRoutes = require("./src/routes/passwordRoutes"); // 👈 1. Agrega esta línea
const examRoutes = require('./src/routes/examRoutes');

dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/password", passwordRoutes); // 👈 2. Agrega esta línea
app.use('/api/exams', examRoutes);

module.exports = app;