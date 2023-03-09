const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ProjectSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4, // Generate unique ids using uuid library
    },
    name: { type: String, required: true },
    projectCharter: { type: String, required: true },
    completedPercent: { type: Number, required: true },
    owner: {
      type: String,
      ref: "User",
      required: true,
    },
    projectManagers: {
      type: [{ type: String, ref: "User" }],
      required: true,
    },
    members: {
      type: [{ type: String, ref: "User" }],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: false },
    tasks: {
      type: [{ type: String, ref: "Task" }],
      required: true,
    },
    groupChat: { type: Array, required: true },
  },
  { collection: "projects" }
);

module.exports = mongoose.model("Project", ProjectSchema);
