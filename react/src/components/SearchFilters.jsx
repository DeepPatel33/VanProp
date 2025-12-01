import { useState, useEffect } from 'react';
import { propertyAPI } from '../services/api';
import '../styles/SearchFilters.css';

function SearchFilters({ filters, onFilterChange, onSearch }) {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [neighborhoodsRes, typesRes] = await Promise.all([
        propertyAPI.getNeighborhoods(),
        propertyAPI.getPropertyTypes()
      ]);

      if (neighborhoodsRes.data.success) {
        setNeighborhoods(neighborhoodsRes.data.data);
      }

      if (typesRes.data.success) {
        setPropertyTypes(typesRes.data.data);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleInputChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      neighborhood: '',
      minValue: '',
      maxValue: '',
      propertyType: '',
      searchTerm: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="search-filters">
      <form onSubmit={handleSubmit}>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search Address</label>
            <input
              type="text"
              placeholder="Enter address..."
              value={filters.searchTerm}
              onChange={(e) => handleInputChange('searchTerm', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Neighborhood</label>
            <select
              value={filters.neighborhood}
              onChange={(e) => handleInputChange('neighborhood', e.target.value)}
            >
              <option value="">All Neighborhoods</option>
              {neighborhoods.map(neighborhood => (
                <option key={neighborhood.neighborhood_id} value={neighborhood.name}>
                  {neighborhood.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Property Type</label>
            <select
              value={filters.propertyType}
              onChange={(e) => handleInputChange('propertyType', e.target.value)}
            >
              <option value="">All Types</option>
              {propertyTypes.map((type, index) => (
                <option key={index} value={type.legal_type}>
                  {type.legal_type}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Min Value</label>
            <input
              type="number"
              placeholder="Min $"
              value={filters.minValue}
              onChange={(e) => handleInputChange('minValue', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Max Value</label>
            <input
              type="number"
              placeholder="Max $"
              value={filters.maxValue}
              onChange={(e) => handleInputChange('maxValue', e.target.value)}
            />
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn-search">
              🔍 Search
            </button>
            <button 
              type="button" 
              onClick={handleClearFilters}
              className="btn-clear"
            >
              Clear
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SearchFilters;
