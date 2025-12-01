/**
 * User Model
 * Handles all database operations related to users
 */

const { query, queryOne, run } = require('../db/config');

/**
 * Get all users
 */
const getAllUsers = async () => {
    const sql = `
        SELECT 
            user_id,
            username,
            email,
            full_name,
            preferred_neighborhoods,
            price_range_min,
            price_range_max,
            account_status,
            created_at,
            last_login
        FROM users
        ORDER BY created_at DESC
    `;
    return await query(sql);
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
    const sql = `
        SELECT 
            user_id,
            username,
            email,
            full_name,
            preferred_neighborhoods,
            price_range_min,
            price_range_max,
            account_status,
            created_at,
            updated_at,
            last_login
        FROM users
        WHERE user_id = ?
    `;
    return await queryOne(sql, [userId]);
};

/**
 * Get user by username
 */
const getUserByUsername = async (username) => {
    const sql = `
        SELECT 
            user_id,
            username,
            email,
            full_name,
            preferred_neighborhoods,
            price_range_min,
            price_range_max,
            account_status,
            created_at,
            last_login
        FROM users
        WHERE username = ?
    `;
    return await queryOne(sql, [username]);
};

/**
 * Get user by email
 */
const getUserByEmail = async (email) => {
    const sql = `
        SELECT 
            user_id,
            username,
            email,
            full_name,
            account_status
        FROM users
        WHERE email = ?
    `;
    return await queryOne(sql, [email]);
};

/**
 * Create new user
 */
const createUser = async (userData) => {
    const sql = `
        INSERT INTO users (username, email, full_name, account_status)
        VALUES (?, ?, ?, ?)
    `;
    
    const params = [
        userData.username,
        userData.email,
        userData.full_name,
        userData.account_status || 'active'
    ];

    const result = await run(sql, params);
    return result.lastID;
};

/**
 * Update user profile
 */
const updateUser = async (userId, updates) => {
    const fields = [];
    const params = [];

    if (updates.full_name !== undefined) {
        fields.push('full_name = ?');
        params.push(updates.full_name);
    }

    if (updates.email !== undefined) {
        fields.push('email = ?');
        params.push(updates.email);
    }

    if (updates.preferred_neighborhoods !== undefined) {
        fields.push('preferred_neighborhoods = ?');
        const neighborhoods = typeof updates.preferred_neighborhoods === 'object'
            ? JSON.stringify(updates.preferred_neighborhoods)
            : updates.preferred_neighborhoods;
        params.push(neighborhoods);
    }

    if (updates.price_range_min !== undefined) {
        fields.push('price_range_min = ?');
        params.push(updates.price_range_min);
    }

    if (updates.price_range_max !== undefined) {
        fields.push('price_range_max = ?');
        params.push(updates.price_range_max);
    }

    if (updates.account_status !== undefined) {
        fields.push('account_status = ?');
        params.push(updates.account_status);
    }

    if (fields.length === 0) {
        throw new Error('No fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(userId);

    const sql = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE user_id = ?
    `;

    const result = await run(sql, params);
    return result.changes;
};

/**
 * Update user's last login timestamp
 */
const updateLastLogin = async (userId) => {
    const sql = `
        UPDATE users
        SET last_login = CURRENT_TIMESTAMP
        WHERE user_id = ?
    `;
    
    const result = await run(sql, [userId]);
    return result.changes;
};

/**
 * Delete user
 */
const deleteUser = async (userId) => {
    const sql = `DELETE FROM users WHERE user_id = ?`;
    const result = await run(sql, [userId]);
    return result.changes;
};

/**
 * Get user activity summary
 */
const getUserActivitySummary = async (userId) => {
    const sql = `
        SELECT 
            u.username,
            u.full_name,
            u.account_status,
            u.last_login,
            COUNT(DISTINCT w.watchlist_id) as watchlist_count,
            COUNT(DISTINCT s.search_id) as saved_searches_count,
            COUNT(DISTINCT c.comparison_id) as comparisons_count
        FROM users u
        LEFT JOIN watchlist w ON u.user_id = w.user_id
        LEFT JOIN saved_searches s ON u.user_id = s.user_id
        LEFT JOIN property_comparisons c ON u.user_id = c.user_id
        WHERE u.user_id = ?
        GROUP BY u.user_id, u.username, u.full_name, u.account_status, u.last_login
    `;
    return await queryOne(sql, [userId]);
};

/**
 * Check if username exists
 */
const usernameExists = async (username) => {
    const sql = `SELECT user_id FROM users WHERE username = ?`;
    const result = await queryOne(sql, [username]);
    return !!result;
};

/**
 * Check if email exists
 */
const emailExists = async (email) => {
    const sql = `SELECT user_id FROM users WHERE email = ?`;
    const result = await queryOne(sql, [email]);
    return !!result;
};

/**
 * Get inactive users (not logged in for X days)
 */
const getInactiveUsers = async (daysInactive = 90) => {
    const sql = `
        SELECT 
            user_id,
            username,
            email,
            full_name,
            last_login,
            account_status
        FROM users
        WHERE last_login < date('now', '-' || ? || ' days')
            OR last_login IS NULL
        ORDER BY last_login ASC NULLS FIRST
    `;
    return await query(sql, [daysInactive]);
};

module.exports = {
    getAllUsers,
    getUserById,
    getUserByUsername,
    getUserByEmail,
    createUser,
    updateUser,
    updateLastLogin,
    deleteUser,
    getUserActivitySummary,
    usernameExists,
    emailExists,
    getInactiveUsers
};
