/**
 * Watchlist Model
 * Handles all database operations related to user watchlists
 */

const { query, queryOne, run } = require('../db/config');

/**
 * Get all watchlist items for a user
 */
const getUserWatchlist = async (userId) => {
    const sql = `
        SELECT 
            w.watchlist_id,
            w.notes,
            w.tags,
            w.priority,
            w.added_at,
            w.updated_at,
            p.property_id,
            p.pid,
            p.civic_address,
            p.property_type,
            p.current_total_value,
            p.current_land_value,
            p.current_improvement_value,
            p.tax_levy,
            n.neighborhood_name
        FROM watchlist w
        INNER JOIN properties p ON w.property_id = p.property_id
        INNER JOIN neighborhoods n ON p.neighborhood_id = n.neighborhood_id
        WHERE w.user_id = ?
        ORDER BY w.priority ASC, w.added_at DESC
    `;
    return await query(sql, [userId]);
};

/**
 * Get a specific watchlist item
 */
const getWatchlistItem = async (watchlistId) => {
    const sql = `
        SELECT 
            w.*,
            p.civic_address,
            p.current_total_value,
            n.neighborhood_name
        FROM watchlist w
        INNER JOIN properties p ON w.property_id = p.property_id
        INNER JOIN neighborhoods n ON p.neighborhood_id = n.neighborhood_id
        WHERE w.watchlist_id = ?
    `;
    return await queryOne(sql, [watchlistId]);
};

/**
 * Check if property is in user's watchlist
 */
const isPropertyInWatchlist = async (userId, propertyId) => {
    const sql = `
        SELECT watchlist_id
        FROM watchlist
        WHERE user_id = ? AND property_id = ?
    `;
    const result = await queryOne(sql, [userId, propertyId]);
    return !!result;
};

/**
 * Add property to watchlist
 */
const addToWatchlist = async (userId, propertyId, notes = '', priority = 3, tags = null) => {
    // Check if already exists
    const exists = await isPropertyInWatchlist(userId, propertyId);
    if (exists) {
        throw new Error('Property already in watchlist');
    }

    const sql = `
        INSERT INTO watchlist (user_id, property_id, notes, priority, tags)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await run(sql, [userId, propertyId, notes, priority, tags]);
    return result.lastID;
};

/**
 * Update watchlist item
 */
const updateWatchlistItem = async (watchlistId, updates) => {
    const fields = [];
    const params = [];

    if (updates.notes !== undefined) {
        fields.push('notes = ?');
        params.push(updates.notes);
    }

    if (updates.priority !== undefined) {
        fields.push('priority = ?');
        params.push(updates.priority);
    }

    if (updates.tags !== undefined) {
        fields.push('tags = ?');
        params.push(updates.tags);
    }

    if (fields.length === 0) {
        throw new Error('No fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(watchlistId);

    const sql = `
        UPDATE watchlist
        SET ${fields.join(', ')}
        WHERE watchlist_id = ?
    `;

    const result = await run(sql, params);
    return result.changes;
};

/**
 * Remove property from watchlist
 */
const removeFromWatchlist = async (watchlistId) => {
    const sql = `DELETE FROM watchlist WHERE watchlist_id = ?`;
    const result = await run(sql, [watchlistId]);
    return result.changes;
};

/**
 * Remove property from user's watchlist by user_id and property_id
 */
const removePropertyFromUserWatchlist = async (userId, propertyId) => {
    const sql = `DELETE FROM watchlist WHERE user_id = ? AND property_id = ?`;
    const result = await run(sql, [userId, propertyId]);
    return result.changes;
};

/**
 * Get watchlist statistics for a user
 */
const getWatchlistStats = async (userId) => {
    const sql = `
        SELECT 
            COUNT(*) as total_properties,
            ROUND(AVG(p.current_total_value), 2) as avg_value,
            ROUND(MIN(p.current_total_value), 2) as min_value,
            ROUND(MAX(p.current_total_value), 2) as max_value,
            COUNT(CASE WHEN w.priority = 1 THEN 1 END) as high_priority_count,
            COUNT(CASE WHEN w.priority = 5 THEN 1 END) as low_priority_count
        FROM watchlist w
        INNER JOIN properties p ON w.property_id = p.property_id
        WHERE w.user_id = ?
    `;
    return await queryOne(sql, [userId]);
};

/**
 * Get watchlist grouped by neighborhood
 */
const getWatchlistByNeighborhood = async (userId) => {
    const sql = `
        SELECT 
            n.neighborhood_name,
            COUNT(w.watchlist_id) as property_count,
            ROUND(AVG(p.current_total_value), 2) as avg_value
        FROM watchlist w
        INNER JOIN properties p ON w.property_id = p.property_id
        INNER JOIN neighborhoods n ON p.neighborhood_id = n.neighborhood_id
        WHERE w.user_id = ?
        GROUP BY n.neighborhood_id, n.neighborhood_name
        ORDER BY property_count DESC
    `;
    return await query(sql, [userId]);
};

/**
 * Clear all watchlist items for a user
 */
const clearWatchlist = async (userId) => {
    const sql = `DELETE FROM watchlist WHERE user_id = ?`;
    const result = await run(sql, [userId]);
    return result.changes;
};

module.exports = {
    getUserWatchlist,
    getWatchlistItem,
    isPropertyInWatchlist,
    addToWatchlist,
    updateWatchlistItem,
    removeFromWatchlist,
    removePropertyFromUserWatchlist,
    getWatchlistStats,
    getWatchlistByNeighborhood,
    clearWatchlist
};
