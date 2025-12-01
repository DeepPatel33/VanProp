import { useState, useEffect } from 'react';
import { watchlistAPI, savedSearchAPI } from '../services/api';
import '../styles/DashboardPage.css';

function DashboardPage({ currentUser, onNavigate }) {
  const [watchlist, setWatchlist] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const [watchlistRes, searchesRes, statsRes] = await Promise.all([
        watchlistAPI.getUserWatchlist(currentUser.user_id),
        savedSearchAPI.getUserSavedSearches(currentUser.user_id),
        watchlistAPI.getWatchlistStats(currentUser.user_id)
      ]);

      if (watchlistRes.data.success) {
        setWatchlist(watchlistRes.data.data);
      }
      if (searchesRes.data.success) {
        setSavedSearches(searchesRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (watchlistId) => {
    try {
      await watchlistAPI.removeFromWatchlist(watchlistId);
      setWatchlist(watchlist.filter(item => item.watchlist_id !== watchlistId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const deleteSavedSearch = async (searchId) => {
    try {
      await savedSearchAPI.deleteSavedSearch(searchId);
      setSavedSearches(savedSearches.filter(search => search.search_id !== searchId));
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="dashboard-page">
        <div className="no-user-message">
          <h2>Please Select a User</h2>
          <p>Select a user from the dropdown to view your dashboard</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <p>Welcome back, {currentUser.username}!</p>
      </div>

      <section className="dashboard-stats">
        <div className="stat-card">
          <h3>{stats?.total_properties || 0}</h3>
          <p>Properties in Watchlist</p>
        </div>
        <div className="stat-card">
          <h3>{savedSearches.length}</h3>
          <p>Saved Searches</p>
        </div>
        <div className="stat-card">
          <h3>${((stats?.avg_value || 0) / 1000000).toFixed(2)}M</h3>
          <p>Avg. Watchlist Value</p>
        </div>
        <div className="stat-card">
          <h3>${((stats?.total_value || 0) / 1000000).toFixed(2)}M</h3>
          <p>Total Watchlist Value</p>
        </div>
      </section>

      <section className="watchlist-section">
        <div className="section-header">
          <h2>My Watchlist</h2>
          <button onClick={() => onNavigate('search')} className="btn-primary">Browse Properties</button>
        </div>

        {watchlist.length === 0 ? (
          <div className="empty-state">
            <p>Your watchlist is empty</p>
            <button onClick={() => onNavigate('search')} className="btn-primary">Browse Properties</button>
          </div>
        ) : (
          <div className="watchlist-grid">
            {watchlist.map(item => (
              <div key={item.watchlist_id} className="watchlist-card">
                <div className="card-header">
                  <button onClick={() => onNavigate('property-details', item.property_id)}>
                    <h3>{item.civic_address}</h3>
                  </button>
                  <button 
                    onClick={() => removeFromWatchlist(item.watchlist_id)}
                    className="remove-btn"
                  >
                    ✕
                  </button>
                </div>
                <p className="neighborhood">{item.neighborhood_name}</p>
                <div className="property-values">
                  <div>
                    <label>Current Value</label>
                    <span>${item.current_total_value?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div>
                    <label>Tax Levy</label>
                    <span>${item.tax_levy?.toLocaleString() || 'N/A'}</span>
                  </div>
                </div>
                <div className="card-footer">
                  <small>Added: {new Date(item.added_date).toLocaleDateString()}</small>
                  {item.notes && <p className="notes">{item.notes}</p>}
                </div>
                <button 
                  onClick={() => onNavigate('property-details', item.property_id)}
                  className="view-details-btn"
                >
                  View Details →
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="saved-searches-section">
        <div className="section-header">
          <h2>Saved Searches</h2>
          <button onClick={() => onNavigate('search')} className="btn-primary">Create a Search</button>
        </div>

        {savedSearches.length === 0 ? (
          <div className="empty-state">
            <p>No saved searches yet</p>
            <button onClick={() => onNavigate('search')} className="btn-primary">Create a Search</button>
          </div>
        ) : (
          <div className="saved-searches-list">
            {savedSearches.map(search => {
              const criteria = JSON.parse(search.search_criteria || '{}');
              return (
                <div key={search.search_id} className="search-card">
                  <div className="search-header">
                    <h3>{search.search_name}</h3>
                    <button 
                      onClick={() => deleteSavedSearch(search.search_id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="search-criteria">
                    {criteria.neighborhood && <span>Neighborhood: {criteria.neighborhood}</span>}
                    {criteria.minPrice && <span>Min: ${criteria.minPrice}</span>}
                    {criteria.maxPrice && <span>Max: ${criteria.maxPrice}</span>}
                    {criteria.propertyType && <span>Type: {criteria.propertyType}</span>}
                  </div>
                  <div className="search-footer">
                    <small>Created: {new Date(search.created_date).toLocaleDateString()}</small>
                    <small>Last run: {search.last_executed ? new Date(search.last_executed).toLocaleDateString() : 'Never'}</small>
                  </div>
                  <button 
                    onClick={() => onNavigate('search')}
                    className="run-search-btn"
                  >
                    Run This Search →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
