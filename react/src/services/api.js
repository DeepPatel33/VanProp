import axios from 'axios';

const API_BASE_URL = 'https://glowing-parakeet-q7g5pvr6w4p5cxx4v-5000.app.github.dev/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const propertyAPI = {
  getAllProperties: (params = {}) => api.get('/properties', { params }),
  getPropertyById: (id) => api.get('/properties/' + id),
  getPropertyByPid: (pid) => api.get('/properties/pid/' + pid),
  searchProperties: (term) => api.get('/properties/search/' + term),
  getNeighborhoods: () => api.get('/properties/neighborhoods'),
  getNeighborhoodStats: () => api.get('/properties/stats/neighborhoods'),
  getPropertyTypes: () => api.get('/properties/stats/types'),
  getTopProperties: (limit = 10) => api.get('/properties/top/' + limit)
};

export const watchlistAPI = {
  getUserWatchlist: (userId) => api.get('/watchlist/' + userId),
  addToWatchlist: (data) => api.post('/watchlist', data),
  updateWatchlistItem: (watchlistId, data) => api.put('/watchlist/' + watchlistId, data),
  removeFromWatchlist: (watchlistId) => api.delete('/watchlist/' + watchlistId),
  getWatchlistStats: (userId) => api.get('/watchlist/' + userId + '/stats'),
  checkPropertyInWatchlist: (userId, propertyId) => api.get('/watchlist/check/' + userId + '/' + propertyId)
};

export const savedSearchAPI = {
  getUserSavedSearches: (userId) => api.get('/saved-searches/' + userId),
  createSavedSearch: (data) => api.post('/saved-searches', data),
  updateSavedSearch: (searchId, data) => api.put('/saved-searches/' + searchId, data),
  deleteSavedSearch: (searchId) => api.delete('/saved-searches/' + searchId),
  updateSearchExecution: (searchId) => api.put('/saved-searches/' + searchId + '/execute'),
  getSavedSearchStats: (userId) => api.get('/saved-searches/' + userId + '/stats')
};

export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (userId) => api.get('/users/' + userId),
  createUser: (data) => api.post('/users', data),
  updateUser: (userId, data) => api.put('/users/' + userId, data)
};

export default api;