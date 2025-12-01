const SavedSearch = require('../models/SavedSearch');
const getUserSavedSearches = async (req, res) => {
    try {
        const userId = req.params.userId;
        const searches = await SavedSearch.getUserSavedSearches(userId);

        const parsedSearches = searches.map(search => ({
            ...search,
            search_criteria: JSON.parse(search.search_criteria)
        }));

        res.json({
            success: true,
            count: parsedSearches.length,
            data: parsedSearches
        });
    } catch (error) {
        console.error('Error in getUserSavedSearches:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching saved searches',
            error: error.message
        });
    }
};

const getSavedSearchById = async (req, res) => {
    try {
        const searchId = req.params.searchId;
        const search = await SavedSearch.getSavedSearchById(searchId);

        if (!search) {
            return res.status(404).json({
                success: false,
                message: 'Saved search not found'
            });
        }

        search.search_criteria = JSON.parse(search.search_criteria);

        res.json({
            success: true,
            data: search
        });
    } catch (error) {
        console.error('Error in getSavedSearchById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching saved search',
            error: error.message
        });
    }
};

const createSavedSearch = async (req, res) => {
    try {
        const { user_id, search_name, search_criteria } = req.body;

        if (!user_id || !search_name || !search_criteria) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: user_id, search_name, search_criteria'
            });
        }

        const searchId = await SavedSearch.createSavedSearch(
            user_id,
            search_name,
            search_criteria
        );

        res.status(201).json({
            success: true,
            message: 'Search saved successfully',
            data: { search_id: searchId }
        });
    } catch (error) {
        console.error('Error in createSavedSearch:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating saved search',
            error: error.message
        });
    }
};

const updateSavedSearch = async (req, res) => {
    try {
        const searchId = req.params.searchId;
        const updates = req.body;

        const changes = await SavedSearch.updateSavedSearch(searchId, updates);

        if (changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Saved search not found or no changes made'
            });
        }

        res.json({
            success: true,
            message: 'Saved search updated successfully',
            changes
        });
    } catch (error) {
        console.error('Error in updateSavedSearch:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating saved search',
            error: error.message
        });
    }
};

const updateSearchExecution = async (req, res) => {
    try {
        const searchId = req.params.searchId;
        const { result_count } = req.body;

        if (result_count === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: result_count'
            });
        }

        const changes = await SavedSearch.updateSearchExecution(searchId, result_count);

        if (changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Saved search not found'
            });
        }

        res.json({
            success: true,
            message: 'Search execution updated successfully'
        });
    } catch (error) {
        console.error('Error in updateSearchExecution:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating search execution',
            error: error.message
        });
    }
};

const deleteSavedSearch = async (req, res) => {
    try {
        const searchId = req.params.searchId;
        const changes = await SavedSearch.deleteSavedSearch(searchId);

        if (changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Saved search not found'
            });
        }

        res.json({
            success: true,
            message: 'Saved search deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteSavedSearch:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting saved search',
            error: error.message
        });
    }
};
const getMostUsedSearches = async (req, res) => {
    try {
        const userId = req.params.userId;
        const limit = parseInt(req.query.limit) || 5;
        
        const searches = await SavedSearch.getMostUsedSearches(userId, limit);

        const parsedSearches = searches.map(search => ({
            ...search,
            search_criteria: JSON.parse(search.search_criteria)
        }));

        res.json({
            success: true,
            count: parsedSearches.length,
            data: parsedSearches
        });
    } catch (error) {
        console.error('Error in getMostUsedSearches:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching most used searches',
            error: error.message
        });
    }
};

const getRecentSearches = async (req, res) => {
    try {
        const userId = req.params.userId;
        const limit = parseInt(req.query.limit) || 5;
        
        const searches = await SavedSearch.getRecentSearches(userId, limit);

        // Parse search_criteria JSON strings
        const parsedSearches = searches.map(search => ({
            ...search,
            search_criteria: JSON.parse(search.search_criteria)
        }));

        res.json({
            success: true,
            count: parsedSearches.length,
            data: parsedSearches
        });
    } catch (error) {
        console.error('Error in getRecentSearches:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent searches',
            error: error.message
        });
    }
};
const searchSavedSearches = async (req, res) => {
    try {
        const userId = req.params.userId;
        const searchTerm = req.params.term;
        
        const searches = await SavedSearch.searchSavedSearches(userId, searchTerm);

        // Parse search_criteria JSON strings
        const parsedSearches = searches.map(search => ({
            ...search,
            search_criteria: JSON.parse(search.search_criteria)
        }));

        res.json({
            success: true,
            count: parsedSearches.length,
            data: parsedSearches
        });
    } catch (error) {
        console.error('Error in searchSavedSearches:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching saved searches',
            error: error.message
        });
    }
};
const getSavedSearchStats = async (req, res) => {
    try {
        const userId = req.params.userId;
        const stats = await SavedSearch.getSavedSearchStats(userId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error in getSavedSearchStats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching saved search statistics',
            error: error.message
        });
    }
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
