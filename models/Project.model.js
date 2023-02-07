const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    owner: { type: mongoose.ObjectId, required: true },
    members: { type: Array, required: true },
    projectCharter: { type: String, required: true },
    completedPercent: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    tasks: { type: Array, required: true },
    projectManagers: { type: Array, required: true },
    groupChat: { type: Array, required: true },
  },
  { collection: "projects" }
);

module.exports = mongoose.model("Project", ProjectSchema);
