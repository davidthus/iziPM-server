const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router.route("/").post(projectController.createProject);

router
  .route("/:projectId")
  .get(projectController.getProject)
  .delete(projectController.deleteProject);

router.route("/:projectId/members").post(projectController.addMember);

router.route("/:projectId/ownership").put(projectController.transferOwnership);

router.route("/:projectId/name").patch(projectController.updateProjectName);

router.route("/:projectId/endDate").put(projectController.updateEndDate);

router
  .route("/:projectId/user/:userId/promote")
  .patch(projectController.promoteMember);

router
  .route("/:projectId/user/:userId/demote")
  .patch(projectController.demoteMember);

router
  .route("/projects/:projectId/projectCharter")
  .patch(projectController.updateProjectCharter);

module.exports = router;
