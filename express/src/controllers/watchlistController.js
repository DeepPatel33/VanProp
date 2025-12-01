/**
 * Watchlist Controller
 * Handles HTTP requests and responses for watchlist operations
 */

const Watchlist = require('../models/Watchlist');

/**
 * GET /api/watchlist/:userId
 * Get user's watchlist
 */
const getUserWatchlist = async (req, res) => {
    try {
        const userId = req.params.userId;
        const watchlist = await Watchlist.getUserWatchlist(userId);

        res.json({
            success: true,
            count: watchlist.length,
            data: watchlist
        });
    } catch (error) {
        console.error('Error in getUserWatchlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching watchlist',
            error: error.message
        });
    }
};

/**
 * GET /api/watchlist/item/:watchlistId
 * Get a specific watchlist item
 */
const getWatchlistItem = async (req, res) => {
    try {
        const watchlistId = req.params.watchlistId;
        const item = await Watchlist.getWatchlistItem(watchlistId);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Watchlist item not found'
            });
        }

        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error in getWatchlistItem:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching watchlist item',
            error: error.message
        });
    }
};

/**
 * POST /api/watchlist
 * Add property to watchlist
 */
const addToWatchlist = async (req, res) => {
    try {
        const { user_id, property_id, notes, priority, tags } = req.body;

        // Validate required fields
        if (!user_id || !property_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: user_id, property_id'
            });
        }

        // Parse tags if it's a string
        let parsedTags = tags;
        if (typeof tags === 'object') {
            parsedTags = JSON.stringify(tags);
        }

        const watchlistId = await Watchlist.addToWatchlist(
            user_id,
            property_id,
            notes || '',
            priority || 3,
            parsedTags
        );

        res.status(201).json({
            success: true,
            message: 'Property added to watchlist',
            data: { watchlist_id: watchlistId }
        });
    } catch (error) {
        console.error('Error in addToWatchlist:', error);
        
        if (error.message === 'Property already in watchlist') {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error adding to watchlist',
            error: error.message
        });
    }
};

/**
 * PUT /api/watchlist/:watchlistId
 * Update watchlist item
 */
const updateWatchlistItem = async (req, res) => {
    try {
        const watchlistId = req.params.watchlistId;
        const updates = req.body;

        // Parse tags if it's an object
        if (updates.tags && typeof updates.tags === 'object') {
            updates.tags = JSON.stringify(updates.tags);
        }

        const changes = await Watchlist.updateWatchlistItem(watchlistId, updates);

        if (changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Watchlist item not found or no changes made'
            });
        }

        res.json({
            success: true,
            message: 'Watchlist item updated successfully',
            changes
        });
    } catch (error) {
        console.error('Error in updateWatchlistItem:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating watchlist item',
            error: error.message
        });
    }
};

/**
 * DELETE /api/watchlist/:watchlistId
 * Remove item from watchlist by watchlist_id
 */
const removeFromWatchlist = async (req, res) => {
    try {
        const watchlistId = req.params.watchlistId;
        const changes = await Watchlist.removeFromWatchlist(watchlistId);

        if (changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Watchlist item not found'
            });
        }

        res.json({
            success: true,
            message: 'Property removed from watchlist'
        });
    } catch (error) {
        console.error('Error in removeFromWatchlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing from watchlist',
            error: error.message
        });
    }
};

/**
 * DELETE /api/watchlist/:userId/property/:propertyId
 * Remove property from user's watchlist
 */
const removePropertyFromUserWatchlist = async (req, res) => {
    try {
        const userId = req.params.userId;
        const propertyId = req.params.propertyId;
        
        const changes = await Watchlist.removePropertyFromUserWatchlist(userId, propertyId);

        if (changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Property not found in watchlist'
            });
        }

        res.json({
            success: true,
            message: 'Property removed from watchlist'
        });
    } catch (error) {
        console.error('Error in removePropertyFromUserWatchlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing property from watchlist',
            error: error.message
        });
    }
};

/**
 * GET /api/watchlist/:userId/stats
 * Get watchlist statistics
 */
const getWatchlistStats = async (req, res) => {
    try {
        const userId = req.params.userId;
        const stats = await Watchlist.getWatchlistStats(userId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error in getWatchlistStats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching watchlist statistics',
            error: error.message
        });
    }
};

/**
 * GET /api/watchlist/:userId/by-neighborhood
 * Get watchlist grouped by neighborhood
 */
const getWatchlistByNeighborhood = async (req, res) => {
    try {
        const userId = req.params.userId;
        const data = await Watchlist.getWatchlistByNeighborhood(userId);

        res.json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        console.error('Error in getWatchlistByNeighborhood:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching watchlist by neighborhood',
            error: error.message
        });
    }
};

/**
 * DELETE /api/watchlist/:userId/clear
 * Clear all watchlist items for user
 */
const clearWatchlist = async (req, res) => {
    try {
        const userId = req.params.userId;
        const changes = await Watchlist.clearWatchlist(userId);

        res.json({
            success: true,
            message: `Cleared ${changes} items from watchlist`
        });
    } catch (error) {
        console.error('Error in clearWatchlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing watchlist',
            error: error.message
        });
    }
};

/**
 * GET /api/watchlist/check/:userId/:propertyId
 * Check if property is in user's watchlist
 */
const checkPropertyInWatchlist = async (req, res) => {
    try {
        const userId = req.params.userId;
        const propertyId = req.params.propertyId;
        
        const isInWatchlist = await Watchlist.isPropertyInWatchlist(userId, propertyId);

        res.json({
            success: true,
            in_watchlist: isInWatchlist
        });
    } catch (error) {
        console.error('Error in checkPropertyInWatchlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking watchlist status',
            error: error.message
        });
    }
};

module.exports = {
    getUserWatchlist,
    getWatchlistItem,
    addToWatchlist,
    updateWatchlistItem,
    removeFromWatchlist,
    removePropertyFromUserWatchlist,
    getWatchlistStats,
    getWatchlistByNeighborhood,
    clearWatchlist,
    checkPropertyInWatchlist
};
