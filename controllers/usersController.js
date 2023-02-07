const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @@desc Update a User's notes
// @@route PATCH /users
// @@access Private

const updateNotes = asyncHandler(async (req, res) => {});

// @@desc Update a User
// @@route PATCH /users
// @@access Private

const updateUser = asyncHandler(async (req, res) => {});

module.exports = { updateUser, updateNotes };
