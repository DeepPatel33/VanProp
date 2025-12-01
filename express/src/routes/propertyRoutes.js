/**
 * Property Routes
 * Defines all API endpoints for property operations
 */

const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

// Get all properties with optional filters
// GET /api/properties?neighborhood=Downtown&min_value=1000000&max_value=2000000
router.get('/', propertyController.getAllProperties);

// Get neighborhoods
router.get('/neighborhoods', propertyController.getAllNeighborhoods);

// Get property types
router.get('/property-types', propertyController.getAllPropertyTypes);

// Get neighborhood statistics
router.get('/stats/neighborhoods', propertyController.getNeighborhoodStats);

// Get property type statistics
router.get('/stats/types', propertyController.getPropertyTypeStats);

// Get top properties
router.get('/top/:limit?', propertyController.getTopProperties);

// Search properties by address
router.get('/search/:term', propertyController.searchProperties);

// Get properties by neighborhood
router.get('/neighborhood/:name', propertyController.getPropertiesByNeighborhood);

// Get property by PID
router.get('/pid/:pid', propertyController.getPropertyByPid);

// Get property tax history
router.get('/:id/history', propertyController.getPropertyHistory);

// Get property by ID
router.get('/:id', propertyController.getPropertyById);

// Create new property
router.post('/', propertyController.createProperty);

// Update property
router.put('/:id', propertyController.updateProperty);

// Delete property
router.delete('/:id', propertyController.deleteProperty);

module.exports = router;
