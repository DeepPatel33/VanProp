/**
 * Property Routes
 * Defines all API endpoints for property operations
 */

const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');



router.get('/', propertyController.getAllProperties);


router.get('/neighborhoods', propertyController.getAllNeighborhoods);


router.get('/property-types', propertyController.getAllPropertyTypes);


router.get('/stats/neighborhoods', propertyController.getNeighborhoodStats);


router.get('/stats/types', propertyController.getPropertyTypeStats);


router.get('/top/:limit?', propertyController.getTopProperties);


router.get('/search/:term', propertyController.searchProperties);


router.get('/neighborhood/:name', propertyController.getPropertiesByNeighborhood);


router.get('/pid/:pid', propertyController.getPropertyByPid);


router.get('/:id/history', propertyController.getPropertyHistory);


router.get('/:id', propertyController.getPropertyById);


router.post('/', propertyController.createProperty);


router.put('/:id', propertyController.updateProperty);


router.delete('/:id', propertyController.deleteProperty);

module.exports = router;
