/**
 * Property Model
 * Handles all database operations related to properties
 */

const { query, queryOne, run } = require('../db/config');

/**
 * Get all properties with optional filtering and pagination
 */
const getAllProperties = async (filters = {}) => {
    let sql = `
        SELECT 
            p.*,
            n.neighborhood_name,
            CASE 
                WHEN p.land_area > 0 THEN ROUND(p.current_total_value / p.land_area, 2)
                ELSE NULL 
            END as price_per_sqm
        FROM properties p
        INNER JOIN neighborhoods n ON p.neighborhood_id = n.neighborhood_id
        WHERE 1=1
    `;
    
    const params = [];

    
    if (filters.neighborhood) {
        sql += ` AND n.neighborhood_name = ?`;
        params.push(filters.neighborhood);
    }

    if (filters.property_type) {
        sql += ` AND p.property_type = ?`;
        params.push(filters.property_type);
    }

    if (filters.min_value) {
        sql += ` AND p.current_total_value >= ?`;
        params.push(filters.min_value);
    }

    if (filters.max_value) {
        sql += ` AND p.current_total_value <= ?`;
        params.push(filters.max_value);
    }

    if (filters.search) {
        sql += ` AND p.civic_address LIKE ?`;
        params.push(`%${filters.search}%`);
    }

    
    const sortBy = filters.sort_by || 'current_total_value';
    const sortOrder = filters.sort_order || 'DESC';
    sql += ` ORDER BY p.${sortBy} ${sortOrder}`;

    
    const limit = parseInt(filters.limit) || 50;
    const offset = parseInt(filters.offset) || 0;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return await query(sql, params);
};

/**
 * Get property by ID
 */
const getPropertyById = async (propertyId) => {
    const sql = `
        SELECT 
            p.*,
            n.neighborhood_name,
            n.description as neighborhood_description
        FROM properties p
        INNER JOIN neighborhoods n ON p.neighborhood_id = n.neighborhood_id
        WHERE p.property_id = ?
    `;
    return await queryOne(sql, [propertyId]);
};

/**
 * Get property by PID
 */
const getPropertyByPid = async (pid) => {
    const sql = `
        SELECT 
            p.*,
            n.neighborhood_name
        FROM properties p
        INNER JOIN neighborhoods n ON p.neighborhood_id = n.neighborhood_id
        WHERE p.pid = ?
    `;
    return await queryOne(sql, [pid]);
};

/**
 * Search properties by address
 */
const searchPropertiesByAddress = async (searchTerm) => {
    const sql = `
        SELECT 
            p.property_id,
            p.pid,
            p.civic_address,
            p.current_total_value,
            p.property_type,
            n.neighborhood_name
        FROM properties p
        INNER JOIN neighborhoods n ON p.neighborhood_id = n.neighborhood_id
        WHERE p.civic_address LIKE ?
        ORDER BY p.civic_address
        LIMIT 20
    `;
    return await query(sql, [`%${searchTerm}%`]);
};

/**
 * Get property tax history
 */
const getPropertyHistory = async (propertyId) => {
    const sql = `
        SELECT 
            history_id,
            assessment_year,
            land_value,
            improvement_value,
            total_value,
            tax_levy,
            value_change_percent,
            value_change_amount,
            created_at
        FROM tax_history
        WHERE property_id = ?
        ORDER BY assessment_year DESC
    `;
    return await query(sql, [propertyId]);
};

/**
 * Get properties in a neighborhood
 */
const getPropertiesByNeighborhood = async (neighborhoodName) => {
    const sql = `
        SELECT 
            p.*,
            n.neighborhood_name
        FROM properties p
        INNER JOIN neighborhoods n ON p.neighborhood_id = n.neighborhood_id
        WHERE n.neighborhood_name = ?
        ORDER BY p.current_total_value DESC
        LIMIT 100
    `;
    return await query(sql, [neighborhoodName]);
};

/**
 * Get property statistics by neighborhood
 */
const getNeighborhoodStats = async () => {
    const sql = `
        SELECT 
            n.neighborhood_name,
            COUNT(p.property_id) as property_count,
            ROUND(AVG(p.current_total_value), 2) as avg_value,
            ROUND(MIN(p.current_total_value), 2) as min_value,
            ROUND(MAX(p.current_total_value), 2) as max_value,
            ROUND(SUM(p.tax_levy), 2) as total_tax_revenue
        FROM neighborhoods n
        LEFT JOIN properties p ON n.neighborhood_id = p.neighborhood_id
        GROUP BY n.neighborhood_id, n.neighborhood_name
        ORDER BY property_count DESC
    `;
    return await query(sql);
};

/**
 * Get property type distribution
 */
const getPropertyTypeStats = async () => {
    const sql = `
        SELECT 
            property_type,
            COUNT(*) as count,
            ROUND(AVG(current_total_value), 2) as avg_value,
            ROUND(MIN(current_total_value), 2) as min_value,
            ROUND(MAX(current_total_value), 2) as max_value
        FROM properties
        WHERE property_type IS NOT NULL
        GROUP BY property_type
        ORDER BY count DESC
    `;
    return await query(sql);
};

/**
 * Get top properties by value
 */
const getTopProperties = async (limit = 10) => {
    const sql = `
        SELECT 
            p.property_id,
            p.pid,
            p.civic_address,
            p.current_total_value,
            p.property_type,
            n.neighborhood_name
        FROM properties p
        INNER JOIN neighborhoods n ON p.neighborhood_id = n.neighborhood_id
        ORDER BY p.current_total_value DESC
        LIMIT ?
    `;
    return await query(sql, [limit]);
};

/**
 * Create new property
 */
const createProperty = async (propertyData) => {
    const sql = `
        INSERT INTO properties (
            pid, civic_address, legal_type, neighborhood_id, postal_code,
            coordinates_lat, coordinates_lon, property_type, zoning_classification,
            land_area, current_land_value, current_improvement_value, tax_levy, current_year
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
        propertyData.pid,
        propertyData.civic_address,
        propertyData.legal_type,
        propertyData.neighborhood_id,
        propertyData.postal_code,
        propertyData.coordinates_lat,
        propertyData.coordinates_lon,
        propertyData.property_type,
        propertyData.zoning_classification,
        propertyData.land_area,
        propertyData.current_land_value,
        propertyData.current_improvement_value,
        propertyData.tax_levy,
        propertyData.current_year
    ];

    const result = await run(sql, params);
    return result.lastID;
};

/**
 * Update property
 */
const updateProperty = async (propertyId, propertyData) => {
    const sql = `
        UPDATE properties
        SET 
            current_land_value = ?,
            current_improvement_value = ?,
            tax_levy = ?,
            current_year = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE property_id = ?
    `;
    
    const params = [
        propertyData.current_land_value,
        propertyData.current_improvement_value,
        propertyData.tax_levy,
        propertyData.current_year,
        propertyId
    ];

    const result = await run(sql, params);
    return result.changes;
};

/**
 * Delete property
 */
const deleteProperty = async (propertyId) => {
    const sql = `DELETE FROM properties WHERE property_id = ?`;
    const result = await run(sql, [propertyId]);
    return result.changes;
};

/**
 * Get all neighborhoods
 */
const getAllNeighborhoods = async () => {
    const sql = `
        SELECT 
            neighborhood_id,
            neighborhood_name,
            description
        FROM neighborhoods
        ORDER BY neighborhood_name
    `;
    return await query(sql);
};

/**
 * Get all property types
 */
const getAllPropertyTypes = async () => {
    const sql = `
        SELECT DISTINCT property_type
        FROM properties
        WHERE property_type IS NOT NULL
        ORDER BY property_type
    `;
    return await query(sql);
};

module.exports = {
    getAllProperties,
    getPropertyById,
    getPropertyByPid,
    searchPropertiesByAddress,
    getPropertyHistory,
    getPropertiesByNeighborhood,
    getNeighborhoodStats,
    getPropertyTypeStats,
    getTopProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    getAllNeighborhoods,
    getAllPropertyTypes
};
