/**
 * SavedSearch Routes
 * Defines all API endpoints for saved search operations
 */

const express = require('express');
const router = express.Router();
const savedSearchController = require('../controllers/savedSearchController');


router.get('/:userId/stats', savedSearchController.getSavedSearchStats);


router.get('/:userId/most-used', savedSearchController.getMostUsedSearches);


router.get('/:userId/recent', savedSearchController.getRecentSearches);


router.get('/:userId/search/:term', savedSearchController.searchSavedSearches);


router.get('/:userId', savedSearchController.getUserSavedSearches);


router.get('/search/:searchId', savedSearchController.getSavedSearchById);


router.post('/', savedSearchController.createSavedSearch);


router.put('/:searchId', savedSearchController.updateSavedSearch);


router.put('/:searchId/execute', savedSearchController.updateSearchExecution);


router.delete('/:searchId', savedSearchController.deleteSavedSearch);

module.exports = router;
