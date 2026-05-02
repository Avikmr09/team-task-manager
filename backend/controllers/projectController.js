const Project = require('../models/Project');
const User = require('../models/User');

const createProject = async (req, res) => {
  try {
    const { name, members } = req.body;
    // ensure admin is part of members if not already
    const projectMembers = members || [];
    if (!projectMembers.includes(req.user.id)) {
      projectMembers.push(req.user.id);
    }
    const project = await Project.create({ name, admin: req.user.id, members: projectMembers });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    // get projects where user is either admin or member
    const projects = await Project.find({ $or: [{ admin: req.user.id }, { members: req.user.id }] })
      .populate('admin', 'name email')
      .populate('members', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProject, getProjects, getProjectById };
