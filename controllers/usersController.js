const User = require("../models/User.model");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @@desc Update a User's info
// @@route PATCH /users/:id
// @@access Private

const updateUserInfo = asyncHandler(async (req, res) => {
  const { userId, notes, password, username, avatar } = req.body;

  const sufficientData = userId && notes && password && username && avatar;
  // check if client provides userId and all the other fields
  if (!sufficientData)
    return res.status(400).json({ message: "Insufficient data provided." });

  const user = await User.findOne({ _id: userId });
  // check if user exists
  if (!user) {
    res.status(404).json({ message: "User not found." });
  }

  user.notes = notes;
  user.password = password;
  user.username = username;
  user.avatar = avatar;
  await user.save();
  res.status(200).json({ user });
});

// @@desc Update a User
// @@route PATCH /users/:id
// @@access Private

const updatesjdlf = asyncHandler(async (req, res) => {});

module.exports = { updateUserInfo };
