const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.route("/").post(usersController.createNewUser);

router
  .route("/:id")
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
