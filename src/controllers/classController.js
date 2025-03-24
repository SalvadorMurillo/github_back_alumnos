const Class = require("../models/Class");
const User = require("../models/User");

const createClass = async (req, res) => {
  try {
    const { id, name, email } = req.user; // Datos del creador
    const { className, students } = req.body;

    // Validación básica
    if (!className || !students || !Array.isArray(students)) {
      return res.status(400).json({ message: "Faltan datos o formato incorrecto" });
    }

    // Validar que haya al menos un estudiante
    if (students.length === 0) {
      return res.status(400).json({ message: "Debe incluir al menos un estudiante" });
    }

    // 1. Verificar que el creador no esté en la lista de estudiantes
    const creatorAsStudent = students.some(student => student.email === email);
    if (creatorAsStudent) {
      return res.status(400).json({ 
        message: "El creador no puede ser alumno de la clase",
        error: "CREATOR_AS_STUDENT"
      });
    }

    // 2. Verificar que los emails de estudiantes existan en la BD
    const studentEmails = students.map(student => student.email);
    const existingUsers = await User.find({ email: { $in: studentEmails } });
    
    const missingEmails = studentEmails.filter(email => 
      !existingUsers.some(user => user.email === email)
    );

    if (missingEmails.length > 0) {
      return res.status(400).json({ 
        message: "Algunos estudiantes no existen en el sistema",
        missingEmails,
        error: "STUDENTS_NOT_FOUND"
      });
    }

    // Crear la clase si todo está correcto
    const newClass = new Class({
      name: className,
      creator: id,
      creatorName: name,
      creatorEmail: email,
      students,
      createdAt: new Date()
    });

    await newClass.save();

    res.status(201).json({ 
      success: true,
      message: "Clase creada exitosamente",
      class: newClass
    });

  } catch (error) {
    console.error("❌ Error al crear la clase:", error);
    res.status(500).json({ 
      message: "Error interno al crear la clase",
      error: error.message 
    });
  }
};

// getClasses permanece igual
const getClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las clases" });
  }
};

module.exports = { createClass, getClasses };