const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  creatorEmail: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Alumno asignado
  studentEmail: { type: String, required: true }, // Correo del alumno
  instructions: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["pendiente", "entregado", "fuera de plazo", "no entregado"], default: "pendiente" },
  submission: {
    fileUrl: { type: String, default: null },
    submittedAt: { type: Date, default: null }
  },
  grade: { type: Number, min: 1, max: 10, default: null }
});

module.exports = mongoose.model("Task", TaskSchema);
