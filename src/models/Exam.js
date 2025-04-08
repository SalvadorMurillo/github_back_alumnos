// models/Exam.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  a: { type: String, required: true },
  b: { type: String, required: true },
  c: { type: String, required: true },
  d: { type: String, required: true },
  correct: { 
    type: String, 
    required: true,
    enum: ['a', 'b', 'c', 'd'],
    validate: {
      validator: function(value) {
        return ['a', 'b', 'c', 'd'].includes(value);
      },
      message: props => `${props.value} no es una opción válida (a, b, c, d)`
    }
  }
});

const examSchema = new mongoose.Schema({
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  creatorEmail: { 
    type: String, 
    required: true 
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  studentEmail: { 
    type: String, 
    required: true 
  },
  instructions: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pendiente', 'entregado', 'fuera de plazo', 'no entregado'], 
    default: 'pendiente' 
  },
  dueDate: { 
    type: Date, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  questions: [questionSchema],
  studentAnswers: [{ 
    type: String,
    enum: ['a', 'b', 'c', 'd', null],
    default: null
  }],
  grade: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: null 
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  questionsToShow: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value <= this.totalQuestions && value >= 10;
      },
      message: props => `Debe mostrar entre 10 y ${this.totalQuestions} preguntas`
    }
  }
});

// Middleware para validar antes de guardar
examSchema.pre('save', function(next) {
  if (this.questions.length !== this.questionsToShow) {
    throw new Error(`El examen debe contener exactamente ${this.questionsToShow} preguntas`);
  }
  next();
});

module.exports = mongoose.model('Exam', examSchema);