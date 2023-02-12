const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

router.route("/").post(projectController.createNewProject);

router
  .route("/:projectId")
  .get(projectController.getProject)
  .delete(projectController.deleteProject);

router.route("/:projectId/members").post(projectController.addMember);

router.route("/:projectId/ownership").put(projectController.transferOwnership);

router.route("/:projectId/name").put(projectController.updateProjectName);

router.route("/:projectId/endDate").put(projectController.updateEndDate);

router
  .route("/:projectId/user/:userId/promote")
  .put(projectController.promoteMember);

router
  .route("/:projectId/user/:userId/demote")
  .put(projectController.demoteMember);

router
  .route("/projects/:projectId/projectCharter")
  .put(projectController.updateProjectCharter);

module.exports = router;
