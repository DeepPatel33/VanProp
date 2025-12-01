/**
 * SavedSearch Model
 * Handles all database operations related to saved searches
 */

const { query, queryOne, run } = require('../db/config');

/**
 * Get all saved searches for a user
 */
const getUserSavedSearches = async (userId) => {
    const sql = `
        SELECT 
            search_id,
            search_name,
            search_criteria,
            result_count,
            last_executed,
            execution_count,
            created_at,
            updated_at
        FROM saved_searches
        WHERE user_id = ?
        ORDER BY last_executed DESC NULLS LAST, created_at DESC
    `;
    return await query(sql, [userId]);
};

/**
 * Get a specific saved search
 */
const getSavedSearchById = async (searchId) => {
    const sql = `
        SELECT *
        FROM saved_searches
        WHERE search_id = ?
    `;
    return await queryOne(sql, [searchId]);
};

/**
 * Create a new saved search
 */
const createSavedSearch = async (userId, searchName, searchCriteria) => {
    const sql = `
        INSERT INTO saved_searches (user_id, search_name, search_criteria)
        VALUES (?, ?, ?)
    `;
    
    // Convert search criteria object to JSON string if it's an object
    const criteriaString = typeof searchCriteria === 'object' 
        ? JSON.stringify(searchCriteria) 
        : searchCriteria;

    const result = await run(sql, [userId, searchName, criteriaString]);
    return result.lastID;
};

/**
 * Update saved search
 */
const updateSavedSearch = async (searchId, updates) => {
    const fields = [];
    const params = [];

    if (updates.search_name !== undefined) {
        fields.push('search_name = ?');
        params.push(updates.search_name);
    }

    if (updates.search_criteria !== undefined) {
        fields.push('search_criteria = ?');
        const criteriaString = typeof updates.search_criteria === 'object'
            ? JSON.stringify(updates.search_criteria)
            : updates.search_criteria;
        params.push(criteriaString);
    }

    if (fields.length === 0) {
        throw new Error('No fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(searchId);

    const sql = `
        UPDATE saved_searches
        SET ${fields.join(', ')}
        WHERE search_id = ?
    `;

    const result = await run(sql, params);
    return result.changes;
};

/**
 * Update search execution statistics
 */
const updateSearchExecution = async (searchId, resultCount) => {
    const sql = `
        UPDATE saved_searches
        SET 
            last_executed = CURRENT_TIMESTAMP,
            execution_count = execution_count + 1,
            result_count = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE search_id = ?
    `;
    
    const result = await run(sql, [resultCount, searchId]);
    return result.changes;
};

/**
 * Delete saved search
 */
const deleteSavedSearch = async (searchId) => {
    const sql = `DELETE FROM saved_searches WHERE search_id = ?`;
    const result = await run(sql, [searchId]);
    return result.changes;
};

/**
 * Get most popular saved searches for a user
 */
const getMostUsedSearches = async (userId, limit = 5) => {
    const sql = `
        SELECT 
            search_id,
            search_name,
            search_criteria,
            execution_count,
            last_executed
        FROM saved_searches
        WHERE user_id = ?
        ORDER BY execution_count DESC, last_executed DESC
        LIMIT ?
    `;
    return await query(sql, [userId, limit]);
};

/**
 * Get recently executed searches
 */
const getRecentSearches = async (userId, limit = 5) => {
    const sql = `
        SELECT 
            search_id,
            search_name,
            search_criteria,
            result_count,
            last_executed
        FROM saved_searches
        WHERE user_id = ? AND last_executed IS NOT NULL
        ORDER BY last_executed DESC
        LIMIT ?
    `;
    return await query(sql, [userId, limit]);
};

/**
 * Search saved searches by name
 */
const searchSavedSearches = async (userId, searchTerm) => {
    const sql = `
        SELECT 
            search_id,
            search_name,
            search_criteria,
            result_count,
            last_executed
        FROM saved_searches
        WHERE user_id = ? AND search_name LIKE ?
        ORDER BY search_name
    `;
    return await query(sql, [userId, `%${searchTerm}%`]);
};

/**
 * Get saved search statistics for a user
 */
const getSavedSearchStats = async (userId) => {
    const sql = `
        SELECT 
            COUNT(*) as total_searches,
            COUNT(CASE WHEN last_executed IS NOT NULL THEN 1 END) as executed_searches,
            COUNT(CASE WHEN last_executed IS NULL THEN 1 END) as unused_searches,
            ROUND(AVG(execution_count), 2) as avg_executions,
            MAX(execution_count) as max_executions
        FROM saved_searches
        WHERE user_id = ?
    `;
    return await queryOne(sql, [userId]);
};

module.exports = {
    getUserSavedSearches,
    getSavedSearchById,
    createSavedSearch,
    updateSavedSearch,
    updateSearchExecution,
    deleteSavedSearch,
    getMostUsedSearches,
    getRecentSearches,
    searchSavedSearches,
    getSavedSearchStats
};
