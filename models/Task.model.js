const mongoose = require("mongoose");

const SubtaskSchema = new mongoose.Schema({
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    taskDependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    dueDate: { type: Date, required: true },
    subtasks: [SubtaskSchema],
  },
  {
    collection: "tasks",
  }
);

module.exports = mongoose.model("Task", TaskSchema);
