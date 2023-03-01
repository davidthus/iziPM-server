const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const upload = require("../middleware/upload");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router
  .route("/")
  .get(usersController.getUser)
  .patch(upload.single("image"), usersController.updateUser)
  .delete(usersController.deleteUser);

router.route("/projects").get(usersController.getUserProjects);

module.exports = router;
