const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, addMember, removeMember } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById);

router.route('/:id/members/add')
  .put(protect, addMember);

router.route('/:id/members/remove')
  .put(protect, removeMember);

module.exports = router;
