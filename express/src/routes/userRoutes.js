/**
 * User Routes
 * Defines all API endpoints for user operations
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get inactive users
router.get('/inactive/:days?', userController.getInactiveUsers);

// Get all users
router.get('/', userController.getAllUsers);

// Get user by username
router.get('/username/:username', userController.getUserByUsername);

// Get user activity summary
router.get('/:userId/activity', userController.getUserActivitySummary);

// Get user by ID
router.get('/:userId', userController.getUserById);

// Create new user
router.post('/', userController.createUser);

// Update user
router.put('/:userId', userController.updateUser);

// Update last login
router.put('/:userId/login', userController.updateLastLogin);

// Delete user
router.delete('/:userId', userController.deleteUser);

module.exports = router;
