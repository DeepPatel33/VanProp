import { useState, useEffect } from 'react';
import { propertyAPI, savedSearchAPI } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import SearchFilters from '../components/SearchFilters';
import '../styles/SearchPage.css';

function SearchPage({ currentUser, onNavigate, initialNeighborhood }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    neighborhood: initialNeighborhood || '',
    minValue: '',
    maxValue: '',
    propertyType: '',
    searchTerm: ''
  });
  const [savedSearches, setSavedSearches] = useState([]);

  useEffect(() => {
    searchProperties();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadSavedSearches();
    }
  }, [currentUser]);

  const loadSavedSearches = async () => {
    if (!currentUser) return;
    
    try {
      const response = await savedSearchAPI.getUserSavedSearches(currentUser.user_id);
      if (response.data.success) {
        setSavedSearches(response.data.data);
      }
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const searchProperties = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.neighborhood) params.neighborhood = filters.neighborhood;
      if (filters.minValue) params.minValue = filters.minValue;
      if (filters.maxValue) params.maxValue = filters.maxValue;
      if (filters.propertyType) params.type = filters.propertyType;
      if (filters.searchTerm) params.search = filters.searchTerm;

      const response = await propertyAPI.getAllProperties(params);
      
      if (response.data.success) {
        setProperties(response.data.data);
      }
    } catch (error) {
      console.error('Error searching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = () => {
    searchProperties();
  };

  const handleSaveSearch = async () => {
    if (!currentUser) {
      alert('Please select a user to save searches');
      return;
    }

    const searchName = prompt('Enter a name for this search:');
    if (!searchName) return;

    try {
      const searchData = {
        user_id: currentUser.user_id,
        search_name: searchName,
        search_criteria: JSON.stringify(filters)
      };

      const response = await savedSearchAPI.createSavedSearch(searchData);
      
      if (response.data.success) {
        alert('Search saved successfully!');
        loadSavedSearches();
      }
    } catch (error) {
      console.error('Error saving search:', error);
      alert('Failed to save search');
    }
  };

  const handleLoadSavedSearch = async (savedSearch) => {
    try {
      const criteria = JSON.parse(savedSearch.search_criteria);
      setFilters(criteria);
      
      await savedSearchAPI.updateSearchExecution(savedSearch.search_id);
      
      setTimeout(() => searchProperties(), 100);
    } catch (error) {
      console.error('Error loading saved search:', error);
    }
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h2>Search Properties</h2>
        {currentUser && (
          <button onClick={handleSaveSearch} className="save-search-btn">
            💾 Save This Search
          </button>
        )}
      </div>

      {currentUser && savedSearches.length > 0 && (
        <div className="saved-searches">
          <h3>Your Saved Searches</h3>
          <div className="saved-searches-list">
            {savedSearches.map(search => (
              <button
                key={search.search_id}
                onClick={() => handleLoadSavedSearch(search)}
                className="saved-search-chip"
              >
                {search.search_name}
                <span className="execution-count">Used {search.execution_count}x</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <SearchFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
      />

      <div className="search-results">
        <div className="results-header">
          <h3>Results ({properties.length})</h3>
        </div>

        {loading ? (
          <div className="loading">Searching...</div>
        ) : properties.length === 0 ? (
          <div className="no-results">
            <p>No properties found matching your criteria</p>
            <button onClick={() => {
              setFilters({
                neighborhood: '',
                minValue: '',
                maxValue: '',
                propertyType: '',
                searchTerm: ''
              });
              setTimeout(() => searchProperties(), 100);
            }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="properties-grid">
            {properties.map(property => (
              <PropertyCard 
                key={property.property_id} 
                property={property}
                currentUser={currentUser}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
