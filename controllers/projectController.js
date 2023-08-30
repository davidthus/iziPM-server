const User = require("../models/User.model");
const Project = require("../models/Project.model");
const Task = require("../models/Task.model");
const asyncHandler = require("express-async-handler");
const TaskModel = require("../models/Task.model");

// @desc Create new project
// @route POST /projects
// @access Public
const createProject = asyncHandler(async (req, res) => {
  const { projectName } = req.body;
  const { userId } = req;

  if (!userId) {
    return res.status(400).json({ message: "User Id required." });
  } else if (!projectName) {
    return res.status(400).json({ message: "Project name required." });
  }

  const projectObject = {
    name: projectName,
    groupChat: [],
    completedPercent: 0,
    startDate: Date.now(),
    owner: userId,
    members: [userId],
    tasks: [],
    projectCharter: "",
    projectManagers: [userId],
  };

  const newProject = await Project.create(projectObject);

  if (newProject) {
    // add project to user's project array
    const user = await User.findById(userId);

    user.projects = [...user.projects, newProject._id];

    await user.save();

    //created
    return res.status(201).json({
      message: `New project ${projectName} created.`,
      projectId: newProject._id,
    });
  } else {
    return res.status(400).json({ message: "Invalid project data received." });
  }
});

// @desc Create new project
// @route GET /projects/:projectId
// @access Private
const getProject = asyncHandler(async (req, res) => {
  const { projectId } = req.body;

  const project = await Project.findById(projectId).populate(
    "owner projectManagers members tasks"
  );

  if (!project) {
    res.status(404).json({ message: "Project not found." });
  }

  return res.status(200).json({ project });
});

// @desc Add a new member
// @route POST /projects/:projectId/members
// @access Public
const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const { projectId } = req.params;

  const insufficientData = !userId;
  // check if client provided a user ID
  if (insufficientData) {
    return res.status(400).json({ message: "User Id missing." });
  }

  const project = await Project.findById(projectId);
  const userToAdd = await User.findById(userId).lean();

  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  } else if (!userToAdd) {
    return res.status(400).json({ message: "User does not exist." });
  }

  const isUserAlreadyAMember = project.members.includes(
    (member) => member._id === userId
  );

  if (isUserAlreadyAMember) {
    res
      .status(400)
      .json({ message: `User already in project named '${project.name}'.` });
  }

  project.members.push(userId);
  const updatedProject = await project.save();
  if (updatedProject) return res.status(204);
});

// @desc Transfer ownership to another member
// @route PUT /projects/:projectId/ownership
// @access Private
const transferOwnership = asyncHandler(async (req, res) => {
  const projectId = req.params;
  const { userId } = req.body;

  const insufficientData = !userId || !projectId;
  // check if client provided a project and user ID
  if (insufficientData) {
    return res.status(400).json({ message: "Project or User Id missing." });
  }

  const project = await Project.findById(projectId);
  const user = await User.findById(userId);

  if (!project) {
    return res.status(404).json({ message: "Project can not be found." });
  }

  // check if user is in members array
  const isUserAMember = project.members.includes(
    (member) => member._id === userId
  );
  if (!isUserAMember) {
    res
      .status(400)
      .json({ message: `User is not a member of: '${project.name}'.` });
  } else if (project.owner === userId) {
    res
      .status(400)
      .json({ message: `User named ${user.name} is already owner.` });
  } else {
    project.owner = userId;
    const projectWithNewOwner = await project.save();
    if (projectWithNewOwner) {
      return res.status(200).json({
        message: `Ownership has been transferred to user ${user.name}.`,
      });
    }
  }
});

// @desc Update project name
// @route PATCH /projects/:projectId/name
// @access Private
const updateProjectName = asyncHandler(async (req, res) => {
  const { newProjectName } = req.body;
  const { projectId } = req.params;

  const insufficientData = !newProjectName;
  // check if client provided a project name
  if (insufficientData) {
    return res.status(400).json({ message: "New project name is missing." });
  }

  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project can not be found." });
  }

  project.name = newProjectName;
  const updatedProject = await project.save();

  if (updatedProject) {
    res
      .status(204)
      .json({ message: `Project name updated to ${newProjectName}.` });
  } else {
    return res.status(400).json({ message: "Something went wrong." });
  }
});

// @desc Update project's end date
// @route PUT /projects/:projectId/endDate
// @access Private
const updateEndDate = asyncHandler(async (req, res) => {
  const { newEndDate } = req.body;
  const { projectId } = req.params;

  const insufficientData = !endDate;
  // check if client provided a project name
  if (insufficientData) {
    return res.status(400).json({ message: "New end date is missing." });
  }

  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project can not be found." });
  }

  project.endDate = newEndDate;
  const updatedProject = await project.save();

  if (updatedProject) {
    return res.status(204).json({ message: `Project end date updated.` });
  } else {
    return res.status(400).json({ message: "Something went wrong." });
  }
});

// @desc Promote a team member to a project manager
// @route PATCH /projects/:projectId/user/:userId/promote
// @access Private
const promoteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project can not be found." });
  }

  // check if user is in members array
  const isUserAMember = project.members.includes(
    (member) => member._id === userId
  );

  const isUserTheOwner = project.owner._id === userId;

  const isUserAProjectManager = project.projectManagers.includes(
    (pm) => pm._id === userId
  );

  if (!isUserAMember) {
    res
      .status(404)
      .json({ message: "User could not be found in this project." });
  } else if (isUserAProjectManager) {
    return res.status(400).json({
      message: "Can not promote member as they are already a project manager.",
    });
  } else if (isUserTheOwner) {
    return res
      .status(400)
      .json({ message: "Can not promote member as they are the owner." });
  } else {
    project.projectManagers.push(userId);
    const updatedProject = await project.save();

    if (updatedProject) {
      return res
        .status(204)
        .json({ message: `Project member is now a project manager.` });
    } else {
      return res.status(400).json({ message: "Something went wrong." });
    }
  }
});

// @desc Demote a team member to a project manager
// @route PATCH /projects/:projectId/user/:userId/demote
// @access Private
const demoteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project can not be found." });
  }

  // check if user is in members array
  const isUserAMember = project.members.includes(
    (member) => member._id === userId
  );

  const isUserTheOwner = project.owner._id === userId;

  const isUserAProjectManager = project.projectManagers.includes(
    (pm) => pm._id === userId
  );

  if (!isUserAMember) {
    res
      .status(404)
      .json({ message: "User could not be found in this project." });
  } else if (!isUserAProjectManager) {
    return res.status(400).json({
      message: "Can not demote member as they are not a project manager.",
    });
  } else if (isUserTheOwner) {
    return res
      .status(400)
      .json({ message: "Can not demote member as they are the owner." });
  } else {
    project.projectManagers.filter((pm) => pm._id !== userId);
    const updatedProject = await project.save();

    if (updatedProject) {
      return res
        .status(204)
        .json({ message: `Project member has now been demoted.` });
    } else {
      return res.status(400).json({ message: "Something went wrong." });
    }
  }
});

// @desc Update a project's charter
// @route PATCH /projects/:projectId/projectCharter
// @access Private
const updateProjectCharter = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { newProjectCharter } = req.body;

  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project can not be found." });
  }

  const insufficientData = !newProjectCharter;

  if (insufficientData) {
    return res.status(400).json({ message: "New project charter is missing." });
  }

  const updatedProject = await project.save();
  if (updatedProject) {
    return res
      .status(204)
      .json({ message: `Project charter has now been updated.` });
  } else {
    return res.status(400).json({ message: "Something went wrong." });
  }
});

// @desc Delete a project
// @route DELETE /projects/:projectId
// @access Private
const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  }

  // remove this project id from each member's project array
  project.members.forEach((memberId) => {
    User.findById(memberId).then(function (user) {
      user.projects.filter((project) => project._id !== projectId);
      return user.save();
    });
  });

  // delete tasks that reference this project in their projectId key
  const projectTasks = await Task.find({ projectId });
  projectTasks.forEach((task) => {
    task.remove();
  });

  const result = await project.deleteOne();

  const reply = `Project ${result.name} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getProject,
  createProject,
  updateProjectName,
  updateProjectCharter,
  transferOwnership,
  addMember,
  promoteMember,
  demoteMember,
  updateEndDate,
  deleteProject,
};
