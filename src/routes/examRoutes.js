const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const examController = require('../controllers/examController');

// Crear exámenes para una clase
router.post('/', authMiddleware, examController.createExamForClass);

// Obtener examen específico
router.get('/:id', authMiddleware, examController.getExamById);

// Enviar respuestas de examen
router.post('/:id/submit', authMiddleware, examController.submitExam);

// Obtener resultados de examen
router.get('/:id/result', authMiddleware, examController.getExamResult);

// Obtener todos los exámenes de una clase (para profesores)
router.get('/class/:classId', authMiddleware, examController.getExamsByClass);

// Obtener exámenes de un estudiante
router.get('/student/my-exams', authMiddleware, examController.getStudentExams);

module.exports = router;