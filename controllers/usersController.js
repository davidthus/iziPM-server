const User = require("../models/User.model");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
// const DefaultUserPfp = require("");

// @desc Get a user
// @route GET /users
// @access Public
const getUser = asyncHandler(async (req, res) => {
  const { userId } = req;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User could not be found." });
  } else {
    return res.status(200).json({ user });
  }
});

// @desc Get a user's projects
// @route GET /users/projects
// @access Public
const getUserProjects = asyncHandler(async (req, res) => {
  const { userId } = req;

  const user = await User.findById(userId).populate("projects");
  // .populate({
  //   path: "projects",
  //   populate: [
  //     { path: "owner" },
  //     { path: "projectManagers" },
  //     { path: "members" },
  //     {
  //       path: "tasks",
  //       populate: [
  //         { path: "assignedTo" },
  //         { path: "dependencies" },
  //         { path: "projectId" },
  //       ],
  //     },
  //   ],
  // });

  if (!user) {
    return res.status(404).json({ message: "User could not be found." });
  } else {
    console.log(user);
    return res.status(200).json({ projects: user.projects });
  }
});

// @@desc Update User
// @@route PATCH /users/:userId
// @@access Private

const updateUser = asyncHandler(async (req, res) => {
  const { notes, password, username } = req.body;
  const avatar = req.file;
  const { userId } = req;

  const insufficientData = !notes || !username;
  // check if client provides id and all the other fields
  if (insufficientData)
    return res
      .status(400)
      .json({ message: "All fields except password and avatar are required." });

  const user = await User.findById(userId).exec();
  // check if user exists
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Check for duplicate
  const duplicateUsername = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow updates to the original user
  if (duplicateUsername && duplicateUsername?._id.toString() !== userId) {
    return res.status(409).json({ message: "Duplicate username or email" });
  }

  user.notes = notes;
  user.username = username;
  if (avatar) {
    user.avatar = {
      data: avatar.buffer,
      contentType: avatar.mimetype,
    };
  }
  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updatedUser = await user.save();
  return res.status(200).json({ message: `${updatedUser.username} updated.` });
});

// @@desc Delete a User
// @@route DELETE /users/:userId
// @@access Private

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req;

  // Does the user still have assigned tasks?
  // Do they belong to any projects?
  // const note = await Note.findOne({ user: id }).lean().exec()
  // if (note) {
  //     return res.status(400).json({ message: 'User has assigned notes' })
  // }

  // Does the user exist to delete?
  const user = await User.findById(userId);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  updateUser,
  deleteUser,
  getUser,
  getUserProjects,
};
