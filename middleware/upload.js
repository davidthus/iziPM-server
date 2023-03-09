const multer = require("multer");

// Set up a storage engine for multer to use
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // Specify the directory to save the uploaded file
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

// Set up a multer upload object with the storage engine and other options
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // Limit file size to 5 MB
  },
});

module.exports = upload;
