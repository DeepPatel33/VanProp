/**
 * User Controller
 * Handles HTTP requests and responses for user operations
 */

const User = require('../models/User');

/**
 * GET /api/users
 * Get all users
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

/**
 * GET /api/users/:userId
 * Get user by ID
 */
const getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.getUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        
        if (user.preferred_neighborhoods) {
            try {
                user.preferred_neighborhoods = JSON.parse(user.preferred_neighborhoods);
            } catch (e) {
                
            }
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

/**
 * GET /api/users/username/:username
 * Get user by username
 */
const getUserByUsername = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.getUserByUsername(username);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error in getUserByUsername:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

/**
 * POST /api/users
 * Create a new user
 */
const createUser = async (req, res) => {
    try {
        const { username, email, full_name, account_status } = req.body;

        
        if (!username || !email || !full_name) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: username, email, full_name'
            });
        }

        
        const usernameExists = await User.usernameExists(username);
        if (usernameExists) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        const emailExists = await User.emailExists(email);
        if (emailExists) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const userId = await User.createUser({
            username,
            email,
            full_name,
            account_status: account_status || 'active'
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { user_id: userId }
        });
    } catch (error) {
        console.error('Error in createUser:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};

/**
 * PUT /api/users/:userId
 * Update user profile
 */
const updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const updates = req.body;

        const changes = await User.updateUser(userId, updates);

        if (changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found or no changes made'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            changes
        });
    } catch (error) {
        console.error('Error in updateUser:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};

/**
 * PUT /api/users/:userId/login
 * Update user's last login timestamp
 */
const updateLastLogin = async (req, res) => {
    try {
        const userId = req.params.userId;
        const changes = await User.updateLastLogin(userId);

        if (changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Last login updated successfully'
        });
    } catch (error) {
        console.error('Error in updateLastLogin:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating last login',
            error: error.message
        });
    }
};

/**
 * DELETE /api/users/:userId
 * Delete a user
 */
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const changes = await User.deleteUser(userId);

        if (changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

/**
 * GET /api/users/:userId/activity
 * Get user activity summary
 */
const getUserActivitySummary = async (req, res) => {
    try {
        const userId = req.params.userId;
        const summary = await User.getUserActivitySummary(userId);

        if (!summary) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error in getUserActivitySummary:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user activity',
            error: error.message
        });
    }
};

/**
 * GET /api/users/inactive/:days?
 * Get inactive users
 */
const getInactiveUsers = async (req, res) => {
    try {
        const days = parseInt(req.params.days) || 90;
        const users = await User.getInactiveUsers(days);

        res.json({
            success: true,
            count: users.length,
            data: users,
            criteria: `Not logged in for ${days} days`
        });
    } catch (error) {
        console.error('Error in getInactiveUsers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inactive users',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    getUserByUsername,
    createUser,
    updateUser,
    updateLastLogin,
    deleteUser,
    getUserActivitySummary,
    getInactiveUsers
};
