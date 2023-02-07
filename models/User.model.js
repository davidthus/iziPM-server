const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { required: true, type: String },
    email: {
      required: true,
      type: String,
      unique: true,
      match:
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    },
    password: { required: true, type: String, min: 5, max: 40 },
    notes: { required: true, type: String, default: "" },
    avatar: { required: false, type: Buffer },
    projects: { required: true, type: Array, default: [] },
  },
  {
    collection: "project",
  }
);

module.exports = mongoose.model("User", UserSchema);
