/**
 * Watchlist Routes
 * Defines all API endpoints for watchlist operations
 */

const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');


router.get('/:userId/stats', watchlistController.getWatchlistStats);


router.get('/:userId/by-neighborhood', watchlistController.getWatchlistByNeighborhood);


router.delete('/:userId/clear', watchlistController.clearWatchlist);


router.get('/:userId', watchlistController.getUserWatchlist);


router.get('/item/:watchlistId', watchlistController.getWatchlistItem);


router.get('/check/:userId/:propertyId', watchlistController.checkPropertyInWatchlist);


router.post('/', watchlistController.addToWatchlist);


router.put('/:watchlistId', watchlistController.updateWatchlistItem);


router.delete('/:watchlistId', watchlistController.removeFromWatchlist);


router.delete('/:userId/property/:propertyId', watchlistController.removePropertyFromUserWatchlist);

module.exports = router;
