const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.route("/:id").patch(usersController.updateUserInfo);

module.exports = router;
