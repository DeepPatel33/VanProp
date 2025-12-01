const Property = require('../models/Property');
const getAllProperties = async (req, res) => {
    try {
        const filters = {
            neighborhood: req.query.neighborhood,
            property_type: req.query.property_type,
            min_value: req.query.min_value,
            max_value: req.query.max_value,
            search: req.query.search,
            sort_by: req.query.sort_by,
            sort_order: req.query.sort_order,
            limit: req.query.limit,
            offset: req.query.offset
        };

        const properties = await Property.getAllProperties(filters);

        res.json({
            success: true,
            count: properties.length,
            data: properties
        });
    } catch (error) {
        console.error('Error in getAllProperties:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching properties',
            error: error.message
        });
    }
};
const getPropertyById = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const property = await Property.getPropertyById(propertyId);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Also fetch tax history
        const history = await Property.getPropertyHistory(propertyId);

        res.json({
            success: true,
            data: {
                ...property,
                tax_history: history
            }
        });
    } catch (error) {
        console.error('Error in getPropertyById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching property',
            error: error.message
        });
    }
};



const getPropertyByPid = async (req, res) => {
    try {
        const pid = req.params.pid;
        const property = await Property.getPropertyByPid(pid);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        res.json({
            success: true,
            data: property
        });
    } catch (error) {
        console.error('Error in getPropertyByPid:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching property',
            error: error.message
        });
    }
};

const searchProperties = async (req, res) => {
    try {
        const searchTerm = req.params.term;
        const properties = await Property.searchPropertiesByAddress(searchTerm);

        res.json({
            success: true,
            count: properties.length,
            data: properties
        });
    } catch (error) {
        console.error('Error in searchProperties:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching properties',
            error: error.message
        });
    }
};

const getPropertyHistory = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const history = await Property.getPropertyHistory(propertyId);

        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        console.error('Error in getPropertyHistory:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching property history',
            error: error.message
        });
    }
};

const getPropertiesByNeighborhood = async (req, res) => {
    try {
        const neighborhoodName = req.params.name;
        const properties = await Property.getPropertiesByNeighborhood(neighborhoodName);

        res.json({
            success: true,
            neighborhood: neighborhoodName,
            count: properties.length,
            data: properties
        });
    } catch (error) {
        console.error('Error in getPropertiesByNeighborhood:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching properties by neighborhood',
            error: error.message
        });
    }
};
const getNeighborhoodStats = async (req, res) => {
    try {
        const stats = await Property.getNeighborhoodStats();

        res.json({
            success: true,
            count: stats.length,
            data: stats
        });
    } catch (error) {
        console.error('Error in getNeighborhoodStats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching neighborhood statistics',
            error: error.message
        });
    }
};
const getPropertyTypeStats = async (req, res) => {
    try {
        const stats = await Property.getPropertyTypeStats();

        res.json({
            success: true,
            count: stats.length,
            data: stats
        });
    } catch (error) {
        console.error('Error in getPropertyTypeStats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching property type statistics',
            error: error.message
        });
    }
};

const getTopProperties = async (req, res) => {
    try {
        const limit = parseInt(req.params.limit) || 10;
        const properties = await Property.getTopProperties(limit);

        res.json({
            success: true,
            count: properties.length,
            data: properties
        });
    } catch (error) {
        console.error('Error in getTopProperties:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching top properties',
            error: error.message
        });
    }
};

const createProperty = async (req, res) => {
    try {
        const propertyData = req.body;

        // Validate required fields
        if (!propertyData.pid || !propertyData.civic_address || !propertyData.neighborhood_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: pid, civic_address, neighborhood_id'
            });
        }

        const propertyId = await Property.createProperty(propertyData);

        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            data: { property_id: propertyId }
        });
    } catch (error) {
        console.error('Error in createProperty:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating property',
            error: error.message
        });
    }
};

const updateProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const updates = req.body;

        const changes = await Property.updateProperty(propertyId, updates);

        if (changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Property not found or no changes made'
            });
        }

        res.json({
            success: true,
            message: 'Property updated successfully',
            changes
        });
    } catch (error) {
        console.error('Error in updateProperty:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating property',
            error: error.message
        });
    }
};
const deleteProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const changes = await Property.deleteProperty(propertyId);

        if (changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        res.json({
            success: true,
            message: 'Property deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteProperty:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting property',
            error: error.message
        });
    }
};

const getAllNeighborhoods = async (req, res) => {
    try {
        const neighborhoods = await Property.getAllNeighborhoods();

        res.json({
            success: true,
            count: neighborhoods.length,
            data: neighborhoods
        });
    } catch (error) {
        console.error('Error in getAllNeighborhoods:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching neighborhoods',
            error: error.message
        });
    }
};

const getAllPropertyTypes = async (req, res) => {
    try {
        const types = await Property.getAllPropertyTypes();

        res.json({
            success: true,
            count: types.length,
            data: types.map(t => t.property_type)
        });
    } catch (error) {
        console.error('Error in getAllPropertyTypes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching property types',
            error: error.message
        });
    }
};

module.exports = {
    getAllProperties,
    getPropertyById,
    getPropertyByPid,
    searchProperties,
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
