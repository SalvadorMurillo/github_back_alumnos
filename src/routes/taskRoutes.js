const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/auth");
const {
  createTask,
  getTasksByClass,
  submitTask,
  getSubmissionFile,
  gradeSubmission
} = require("../controllers/taskController");

// Rutas principales
router.post("/", authMiddleware, createTask); // POST /api/tasks - Crear tareas
router.get("/:classId", authMiddleware, getTasksByClass); // GET /api/tasks/:classId - Obtener tareas
router.post("/submit", authMiddleware, upload.single("file"), submitTask); // POST /api/tasks/submit - Entregar tarea
router.get("/submission/:taskId", authMiddleware, getSubmissionFile); // GET /api/tasks/submission/:taskId - Descargar entrega
router.patch("/grade", authMiddleware, gradeSubmission); // PATCH /api/tasks/grade - Calificar tarea

module.exports = router;




// const express = require("express");
// const router = express.Router();
// const upload = require("../middleware/upload");
// const authMiddleware = require("../middleware/auth");
// const {createTask, getTasksByClass, uploadTaskFile, getTaskFile, submitTask, getSubmissionFile, getSubmissionsByTask, gradeSubmission, } = require("../controllers/taskController");

// // Rutas de Tareas
// router.post("/", authMiddleware, createTask); // Crear tarea
// router.get("/:classId", authMiddleware, getTasksByClass); // Obtener tareas de una clase

// // Subir archivo a una tarea
// router.post("/upload", authMiddleware, upload.single("file"), uploadTaskFile);
// router.get("/file/:taskId", authMiddleware, getTaskFile); // Obtener archivo de una tarea

// // Entregar tarea
// router.post("/submit", authMiddleware, upload.single("file"), submitTask);
// router.get("/submission/:submissionId", authMiddleware, getSubmissionFile); // Obtener archivo entregado
// router.get("/submissions/:taskId", authMiddleware, getSubmissionsByTask); // Obtener todas las entregas de una tarea

// // Calificar entrega
// router.post("/grade", authMiddleware, gradeSubmission);

// module.exports = router;
