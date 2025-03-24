const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creatorName: { type: String, required: true },
  creatorEmail: { type: String, required: true },
  students: [{ name: String, email: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Class", ClassSchema);
