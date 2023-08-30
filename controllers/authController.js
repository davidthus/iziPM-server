const User = require("../models/User.model");
const path = require("path");
const fsPromises = require("fs/promises");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// @desc Create new user
// @route POST auth/signup
// @access Public
const signup = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;

  const insufficientData = !username || !password || !email;

  // Confirm data
  if (insufficientData) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate username or email
  const duplicateUsernameOrEmail = await User.findOne({
    $or: [{ username: username }, { email: email }],
  })
    .collation({ locale: "en", strength: 2 })
    .lean();

  if (duplicateUsernameOrEmail) {
    return res.status(409).json({ message: "Duplicate username or email" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const file = await fsPromises.open(
    path.resolve("./public/images/defaultAvatar.png")
  );

  // Read the image file as a binary buffer
  const imageBuffer = await file.readFile();

  await file.close();

  const userObject = {
    username,
    email,
    password: hashedPwd,
    avatar: {
      data: imageBuffer,
      contentType: "image/png",
    },
    notes: `${username}, these are your notes, you can write anything here!`,
    projects: [],
  };

  // Create and store new user
  const user = await User.create(userObject);

  const accessToken = jwt.sign(
    {
      userId: user._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  if (user) {
    //created
    return res.status(201).json({ accessToken });
  } else {
    return res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const insufficientData = !email || !password;

  if (insufficientData) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const foundUser = await User.findOne({ email }).exec();

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) return res.status(401).json({ message: "Unauthorized" });

  const accessToken = jwt.sign(
    {
      userId: foundUser._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: foundUser._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  // Send accessToken containing userId
  res.json({ accessToken });
});

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const foundUser = await User.findById(decoded.userId).exec();

      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = jwt.sign(
        {
          userId: foundUser._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    })
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

module.exports = {
  login,
  signup,
  refresh,
  logout,
};
