const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router
  .route("/")
  .get(usersController)
  .post(usersController)
  .patch(usersController.updateNotes)
  .patch(usersController.updateUser)
  .delete(usersController);

module.exports = router;
