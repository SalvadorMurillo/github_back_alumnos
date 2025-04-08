const Exam = require('../models/Exam');
const Class = require('../models/Class');
const User = require('../models/User');

// Crear exámenes para todos los alumnos de una clase
exports.createExamForClass = async (req, res) => {
  try {
    const { classId, instructions, dueDate, questions, questionsToShow } = req.body;
    const userEmail = req.user.email;

    // Validaciones básicas
    if (!classId || !instructions || !dueDate || !questions || !questionsToShow) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    if (questions.length < 10) {
      return res.status(400).json({ 
        message: 'Debes proporcionar al menos 10 preguntas',
        error: 'MIN_QUESTIONS_REQUIRED'
      });
    }

    if (questionsToShow < 10 || questionsToShow > questions.length) {
      return res.status(400).json({ 
        message: `Debes mostrar entre 10 y ${questions.length} preguntas`,
        error: 'INVALID_QUESTIONS_TO_SHOW'
      });
    }

    // Verificar que el usuario es el creador de la clase
    const classData = await Class.findById(classId);
    if (!classData || classData.creatorEmail !== userEmail) {
      return res.status(403).json({ 
        message: 'No tienes permiso para crear exámenes en esta clase',
        error: 'UNAUTHORIZED'
      });
    }

    // Obtener estudiantes de la clase
    const students = await User.find({ email: { $in: classData.students.map(s => s.email) } });
    if (students.length === 0) {
      return res.status(400).json({ 
        message: 'La clase no tiene estudiantes registrados',
        error: 'NO_STUDENTS_IN_CLASS'
      });
    }

    // Crear un examen para cada estudiante con preguntas aleatorias
    const createdExams = [];
    for (const student of students) {
      // Mezclar preguntas y seleccionar las necesarias
      const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffledQuestions.slice(0, questionsToShow);
      
      // Mezclar el orden de las preguntas para cada estudiante
      const randomizedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);

      const newExam = new Exam({
        classId,
        creatorEmail: userEmail,
        studentId: student._id,
        studentEmail: student.email,
        instructions,
        dueDate: new Date(dueDate),
        questions: randomizedQuestions,
        totalQuestions: questions.length,
        questionsToShow
      });

      await newExam.save();
      createdExams.push({
        examId: newExam._id,
        studentEmail: student.email
      });
    }

    res.status(201).json({ 
      success: true,
      message: `Exámenes creados exitosamente para ${students.length} estudiantes`,
      exams: createdExams
    });

  } catch (error) {
    console.error('Error al crear exámenes:', error);
    res.status(500).json({ 
      message: 'Error interno al crear los exámenes',
      error: error.message 
    });
  }
};

// Obtener examen por ID
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ 
        message: 'Examen no encontrado',
        error: 'EXAM_NOT_FOUND'
      });
    }

    // Verificar permisos
    const isStudent = exam.studentEmail === req.user.email;
    const isCreator = exam.creatorEmail === req.user.email;

    if (!isStudent && !isCreator) {
      return res.status(403).json({ 
        message: 'No tienes permiso para ver este examen',
        error: 'UNAUTHORIZED'
      });
    }

    // Si es el estudiante, ocultar las respuestas correctas
    if (isStudent) {
      const examForStudent = {
        _id: exam._id,
        classId: exam.classId,
        instructions: exam.instructions,
        dueDate: exam.dueDate,
        status: exam.status,
        createdAt: exam.createdAt,
        questions: exam.questions.map(q => ({
          description: q.description,
          a: q.a,
          b: q.b,
          c: q.c,
          d: q.d
        })),
        studentAnswers: exam.studentAnswers,
        grade: exam.grade,
        totalQuestions: exam.questionsToShow
      };

      return res.status(200).json(examForStudent);
    }

    // Si es el creador, mostrar toda la información
    res.status(200).json(exam);

  } catch (error) {
    console.error('Error al obtener examen:', error);
    res.status(500).json({ 
      message: 'Error interno al obtener el examen',
      error: error.message 
    });
  }
};

// Enviar respuestas de examen
exports.submitExam = async (req, res) => {
  try {
    const { answers } = req.body;
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ 
        message: 'Examen no encontrado',
        error: 'EXAM_NOT_FOUND'
      });
    }

    // Verificar permisos
    if (exam.studentEmail !== req.user.email) {
      return res.status(403).json({ 
        message: 'No tienes permiso para enviar este examen',
        error: 'UNAUTHORIZED'
      });
    }

    // Verificar que el examen no haya sido enviado antes
    if (exam.status !== 'pendiente') {
      return res.status(400).json({ 
        message: 'Este examen ya ha sido enviado',
        error: 'EXAM_ALREADY_SUBMITTED'
      });
    }

    // Verificar que se hayan enviado todas las respuestas
    if (!answers || answers.length !== exam.questions.length) {
      return res.status(400).json({ 
        message: `Debes responder todas las ${exam.questions.length} preguntas`,
        error: 'INCOMPLETE_ANSWERS'
      });
    }

    // Validar que todas las respuestas sean válidas (a, b, c, d)
    const invalidAnswers = answers.filter(a => !['a', 'b', 'c', 'd'].includes(a));
    if (invalidAnswers.length > 0) {
      return res.status(400).json({ 
        message: 'Algunas respuestas no son válidas (deben ser a, b, c o d)',
        error: 'INVALID_ANSWERS'
      });
    }

    // Calcular calificación
    let correctAnswers = 0;
    exam.questions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        correctAnswers++;
      }
    });

    const grade = Math.round((correctAnswers / exam.questions.length) * 100);

    // Actualizar examen
    exam.studentAnswers = answers;
    exam.grade = grade;
    exam.status = new Date() > exam.dueDate ? 'fuera de plazo' : 'entregado';
    
    await exam.save();

    res.status(200).json({ 
      success: true,
      message: 'Examen enviado correctamente',
      grade: exam.grade,
      correctAnswers,
      totalQuestions: exam.questions.length
    });

  } catch (error) {
    console.error('Error al enviar examen:', error);
    res.status(500).json({ 
      message: 'Error interno al enviar el examen',
      error: error.message 
    });
  }
};

// Obtener resultados de un examen
exports.getExamResult = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ 
        message: 'Examen no encontrado',
        error: 'EXAM_NOT_FOUND'
      });
    }

    // Verificar permisos
    const isStudent = exam.studentEmail === req.user.email;
    const isCreator = exam.creatorEmail === req.user.email;

    if (!isStudent && !isCreator) {
      return res.status(403).json({ 
        message: 'No tienes permiso para ver estos resultados',
        error: 'UNAUTHORIZED'
      });
    }

    // Preparar respuesta según el rol
    const result = {
      examId: exam._id,
      classId: exam.classId,
      studentId: exam.studentId,
      studentEmail: exam.studentEmail,
      instructions: exam.instructions,
      dueDate: exam.dueDate,
      status: exam.status,
      grade: exam.grade,
      questions: exam.questions.map((q, index) => {
        const questionData = {
          description: q.description,
          studentAnswer: exam.studentAnswers[index],
          correctAnswer: isCreator || exam.status !== 'pendiente' ? q.correct : null,
          options: {
            a: q.a,
            b: q.b,
            c: q.c,
            d: q.d
          }
        };
        return questionData;
      }),
      createdAt: exam.createdAt,
      submittedAt: exam.updatedAt
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('Error al obtener resultados:', error);
    res.status(500).json({ 
      message: 'Error interno al obtener los resultados',
      error: error.message 
    });
  }
};

// Obtener todos los exámenes de una clase (para el profesor)
exports.getExamsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const classData = await Class.findById(classId);

    if (!classData) {
      return res.status(404).json({ 
        message: 'Clase no encontrada',
        error: 'CLASS_NOT_FOUND'
      });
    }

    // Verificar que el usuario es el creador de la clase
    if (classData.creatorEmail !== req.user.email) {
      return res.status(403).json({ 
        message: 'No tienes permiso para ver estos exámenes',
        error: 'UNAUTHORIZED'
      });
    }

    const exams = await Exam.find({ classId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: exams.length,
      exams: exams.map(exam => ({
        _id: exam._id,
        studentEmail: exam.studentEmail,
        status: exam.status,
        grade: exam.grade,
        dueDate: exam.dueDate,
        createdAt: exam.createdAt
      }))
    });

  } catch (error) {
    console.error('Error al obtener exámenes por clase:', error);
    res.status(500).json({ 
      message: 'Error interno al obtener los exámenes',
      error: error.message 
    });
  }
};

// Obtener exámenes de un estudiante
exports.getStudentExams = async (req, res) => {
  try {
    const studentEmail = req.user.email;
    const exams = await Exam.find({ studentEmail }).sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: exams.length,
      exams: exams.map(exam => ({
        _id: exam._id,
        classId: exam.classId,
        instructions: exam.instructions,
        status: exam.status,
        grade: exam.grade,
        dueDate: exam.dueDate,
        createdAt: exam.createdAt,
        totalQuestions: exam.questionsToShow
      }))
    });

  } catch (error) {
    console.error('Error al obtener exámenes del estudiante:', error);
    res.status(500).json({ 
      message: 'Error interno al obtener los exámenes',
      error: error.message 
    });
  }
};