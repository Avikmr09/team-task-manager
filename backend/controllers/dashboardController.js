const Task = require('../models/Task');
const Project = require('../models/Project');

const getDashboardStats = async (req, res) => {
  try {
    // Get projects where user is admin or member
    const projects = await Project.find({ $or: [{ admin: req.user.id }, { members: req.user.id }] });
    const projectIds = projects.map(p => p._id);

    // Get all tasks for these projects
    const tasks = await Task.find({ project: { $in: projectIds } }).populate('assignedTo', 'name');

    // Calculate stats
    const totalTasks = tasks.length;
    
    let statusCounts = { todo: 0, 'in-progress': 0, done: 0 };
    let tasksPerUser = {};
    let tasksPerProject = {};
    let overdueTasksCount = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
      // Group by status
      if (statusCounts[task.status] !== undefined) {
        statusCounts[task.status]++;
      }

      // Group by user
      if (task.assignedTo) {
        const userName = task.assignedTo.name;
        tasksPerUser[userName] = (tasksPerUser[userName] || 0) + 1;
      } else {
        tasksPerUser['Unassigned'] = (tasksPerUser['Unassigned'] || 0) + 1;
      }

      // Group by project
      tasksPerProject[task.project.toString()] = (tasksPerProject[task.project.toString()] || 0) + 1;

      // Overdue
      if (task.dueDate && new Date(task.dueDate) < today && task.status !== 'done') {
        overdueTasksCount++;
      }
    });

    res.json({
      totalTasks,
      statusCounts,
      tasksPerUser,
      tasksPerProject,
      overdueTasksCount,
      totalProjects: projects.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
