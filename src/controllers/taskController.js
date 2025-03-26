const Task = require("../models/Task");
const Class = require("../models/Class");
const path = require('path');
const fs = require('fs');

// Crear una nueva tarea para cada estudiante de la clase
const createTask = async (req, res) => {
  try {
    const { classId, instructions, dueDate } = req.body;
    const creatorEmail = req.user.email;

    // Buscar la clase y obtener la lista de estudiantes
    const classData = await Class.findById(classId).populate("students", "_id email");
    if (!classData) return res.status(404).json({ message: "Clase no encontrada" });

    // Crear una tarea individual para cada estudiante
    const tasks = classData.students.map(student => ({
      classId,
      creatorEmail,
      studentId: student._id,
      studentEmail: student.email,
      instructions,
      dueDate
    }));

    const createdTasks = await Task.insertMany(tasks);
    res.status(201).json({ message: "Tareas creadas y asignadas a los estudiantes", tasks: createdTasks });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la tarea", error: error.message });
  }
};

// Obtener todas las tareas de una clase
const getTasksByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const tasks = await Task.find({ classId });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener tareas" });
  }
};

// Subir una entrega de tarea (Por el estudiante)
const submitTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    const studentEmail = req.user.email;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "Archivo requerido" });

    // Buscar la tarea asignada al estudiante
    const task = await Task.findOne({ _id: taskId, studentEmail });
    if (!task) return res.status(403).json({ message: "No tienes permiso para entregar esta tarea" });

    // Determinar el estado de la entrega
    const now = new Date();
    let status = "entregado";
    if (now > new Date(task.dueDate)) status = "fuera de plazo";

    // Guardar el archivo en la tarea
    task.submission = {
      fileUrl: `/uploads/${file.filename}`,
      submittedAt: now
    };
    task.status = status;

    await task.save();
    res.status(200).json({ message: "Tarea entregada exitosamente", fileUrl: task.submission.fileUrl });
  } catch (error) {
    res.status(500).json({ message: "Error al subir la entrega", error: error.message });
  }
};

// Obtener el archivo de entrega
const getSubmissionFile = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { id: userId, email: userEmail, role: userRole } = req.user; // Asume que el token incluye estos datos

    const task = await Task.findById(taskId)
      .populate('classId', 'creatorEmail') // Populate para obtener el creador de la clase
      .populate('studentId', 'email'); // Populate para obtener el email del estudiante

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    if (!task.submission?.fileUrl) {
      return res.status(404).json({ message: "No hay entregas para esta tarea" });
    }

    // Validación de permisos
    const isProfessorOwner = (userEmail === task.creatorEmail || 
                            (task.classId && userEmail === task.classId.creatorEmail));
    const isStudentOwner = (userEmail === task.studentEmail);

    if (!isProfessorOwner && !isStudentOwner) {
      return res.status(403).json({ 
        message: "No autorizado",
        detail: "Solo el profesor creador o el alumno asignado pueden descargar este archivo"
      });
    }

    const filename = task.submission.fileUrl.split('/').pop();
    const filePath = path.resolve(__dirname, '../uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        message: "Archivo no encontrado",
        detail: `El sistema buscó en: ${filePath}`
      });
    }

    // Nombre personalizado para la descarga
    const downloadName = userRole === 'teacher' 
      ? `entrega-${task.studentEmail}-${filename}`
      : `mi-entrega-${filename}`;

    res.download(filePath, downloadName, (err) => {
      if (err) console.error('Error durante la descarga:', err);
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: "Error al procesar la descarga",
      error: error.message 
    });
  }
};
// Calificar una entrega (Solo el creador de la clase)
const gradeSubmission = async (req, res) => {
  try {
    const { taskId, grade } = req.body;
    const graderEmail = req.user.email;

    if (grade < 1 || grade > 10) return res.status(400).json({ message: "Calificación inválida" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

    if (task.creatorEmail !== graderEmail) {
      return res.status(403).json({ message: "No tienes permiso para calificar esta tarea" });
    }

    task.grade = grade;
    await task.save();

    res.status(200).json({ message: "Calificación asignada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al calificar la entrega" });
  }
};

// Nuevo método para obtener una tarea específica
const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la tarea", error: error.message });
  }
};

module.exports = {
  createTask,
  getTasksByClass,
  getTaskById, // <-- Agregar esta línea
  submitTask,
  getSubmissionFile,
  gradeSubmission
};
