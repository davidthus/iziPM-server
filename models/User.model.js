const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4, // Generate unique ids using uuid library
    },
    username: {
      required: true,
      type: String,
      unique: true,
      minLength: 3,
      maxLength: 40,
    },
    email: {
      required: true,
      type: String,
      unique: true,
      match:
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    },
    password: { required: true, type: String, minLength: 5, maxLength: 70 },
    notes: { required: false, type: String, default: "", maxLength: 2000 },
    avatar: {
      data: Buffer,
      contentType: String,
    },
    projects: {
      required: true,
      type: [{ type: String, ref: "Project" }],
      default: [],
    },
  },
  {
    collection: "users",
  }
);

module.exports = mongoose.model("User", UserSchema);
