// backend/index.js
require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

// const PORT = process.env.PORT || 5000;
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Conectar a MongoDB
mongoose.connect(MONGO_URI)
.then(() => {
  console.log("MongoDB conectado");
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
})
.catch((err) => console.error("Error al conectar a MongoDB:", err));
