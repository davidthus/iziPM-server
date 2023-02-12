const User = require("../models/User.model");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
// const DefaultUserPfp = require("");

// @desc Create new user
// @route POST /users
// @access Public
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;

  const insufficientData = !username || !password || !email;

  // Confirm data
  if (insufficientData) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate username or email
  const duplicateUsernameOrEmail = await User.findOne({ username, email })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicateUsernameOrEmail) {
    return res.status(409).json({ message: "Duplicate username or email" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const userObject = {
    username,
    email,
    password: hashedPwd,
    notes: "",
    projects: [],
  };

  // Create and store new user
  const user = await User.create(userObject);

  if (user) {
    //created
    return res.status(201).json({ message: `New user ${username} created` });
  } else {
    return res.status(400).json({ message: "Invalid user data received" });
  }
});

// @@desc Update User
// @@route PATCH /users/:id
// @@access Private

const updateUser = asyncHandler(async (req, res) => {
  const { notes, password, username, avatar } = req.body;
  const userId = req.params.id;

  const insufficientData = !notes || !username || !avatar;
  // check if client provides id and all the other fields
  if (insufficientData)
    return res
      .status(400)
      .json({ message: "All fields except password are required." });

  const user = await User.findById(userId).exec();
  // check if user exists
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Check for duplicate
  const duplicateUsernameOrEmail = await User.findOne({ username, email })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow updates to the original user
  if (
    duplicateUsernameOrEmail &&
    duplicateUsernameOrEmail?._id.toString() !== userId
  ) {
    return res.status(409).json({ message: "Duplicate username or email" });
  }

  user.notes = notes;
  user.avatar = avatar;
  user.username = username;
  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updatedUser = await user.save();
  return res.status(200).json({ message: `${updatedUser.username} updated.` });
});

// @@desc Delete a User
// @@route PATCH /users/:id
// @@access Private

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

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

module.exports = { updateUser, deleteUser, createNewUser };
