const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const SubtaskSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4, // Generate unique ids using uuid library
  },
  name: String,
  isCompleted: Boolean,
});

const TaskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minLength: 5, maxLength: 60 },
    description: {
      required: false,
      type: String,
      minLength: 10,
      maxLength: 100,
    },
    projectId: {
      type: String,
      ref: "User",
      required: true,
    },
    assignedTo: [{ type: String, ref: "User" }],
    taskDependencies: [{ type: String, ref: "Task" }],
    dueDate: { type: Date, required: true },
    subtasks: [SubtaskSchema],
  },
  {
    collection: "tasks",
  }
);

module.exports = mongoose.model("Task", TaskSchema);
