/**
 * User Routes
 * Defines all API endpoints for user operations
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/inactive/:days?', userController.getInactiveUsers);


router.get('/', userController.getAllUsers);


router.get('/username/:username', userController.getUserByUsername);


router.get('/:userId/activity', userController.getUserActivitySummary);


router.get('/:userId', userController.getUserById);


router.post('/', userController.createUser);


router.put('/:userId', userController.updateUser);


router.put('/:userId/login', userController.updateLastLogin);


router.delete('/:userId', userController.deleteUser);

module.exports = router;
