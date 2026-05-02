const Task = require('../models/Task');
const Project = require('../models/Project');

const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo, projectId } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'admin' && project.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create tasks in this project' });
    }

    const task = await Task.create({
      title, description, dueDate, priority, status, assignedTo, project: projectId
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    const isAdmin = req.user.role === 'admin' || (project && project.admin.toString() === req.user.id);

    if (!isAdmin) {
      if (task.assignedTo && task.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      task.status = status || task.status;
    } else {
      task.title = title || task.title;
      task.description = description || task.description;
      task.dueDate = dueDate || task.dueDate;
      task.priority = priority || task.priority;
      task.status = status || task.status;
      task.assignedTo = assignedTo || task.assignedTo;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (req.user.role !== 'admin' && (!project || project.admin.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasksByProject, updateTask, deleteTask };
