/**
 * Watchlist Routes
 * Defines all API endpoints for watchlist operations
 */

const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');

// Get user's watchlist statistics
router.get('/:userId/stats', watchlistController.getWatchlistStats);

// Get watchlist grouped by neighborhood
router.get('/:userId/by-neighborhood', watchlistController.getWatchlistByNeighborhood);

// Clear user's watchlist
router.delete('/:userId/clear', watchlistController.clearWatchlist);

// Get user's watchlist
router.get('/:userId', watchlistController.getUserWatchlist);

// Get specific watchlist item
router.get('/item/:watchlistId', watchlistController.getWatchlistItem);

// Check if property is in watchlist
router.get('/check/:userId/:propertyId', watchlistController.checkPropertyInWatchlist);

// Add to watchlist
router.post('/', watchlistController.addToWatchlist);

// Update watchlist item
router.put('/:watchlistId', watchlistController.updateWatchlistItem);

// Remove from watchlist by watchlist_id
router.delete('/:watchlistId', watchlistController.removeFromWatchlist);

// Remove property from user's watchlist
router.delete('/:userId/property/:propertyId', watchlistController.removePropertyFromUserWatchlist);

module.exports = router;
