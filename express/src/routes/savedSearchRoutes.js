/**
 * SavedSearch Routes
 * Defines all API endpoints for saved search operations
 */

const express = require('express');
const router = express.Router();
const savedSearchController = require('../controllers/savedSearchController');

// Get user's saved search statistics
router.get('/:userId/stats', savedSearchController.getSavedSearchStats);

// Get most used searches
router.get('/:userId/most-used', savedSearchController.getMostUsedSearches);

// Get recent searches
router.get('/:userId/recent', savedSearchController.getRecentSearches);

// Search saved searches by name
router.get('/:userId/search/:term', savedSearchController.searchSavedSearches);

// Get all saved searches for user
router.get('/:userId', savedSearchController.getUserSavedSearches);

// Get specific saved search
router.get('/search/:searchId', savedSearchController.getSavedSearchById);

// Create new saved search
router.post('/', savedSearchController.createSavedSearch);

// Update saved search
router.put('/:searchId', savedSearchController.updateSavedSearch);

// Update search execution stats
router.put('/:searchId/execute', savedSearchController.updateSearchExecution);

// Delete saved search
router.delete('/:searchId', savedSearchController.deleteSavedSearch);

module.exports = router;
