import { useState, useEffect } from 'react';
import { propertyAPI, watchlistAPI } from '../services/api';
import '../styles/PropertyDetailsPage.css';

function PropertyDetailsPage({ currentUser, propertyId, onNavigate }) {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (propertyId) {
      loadPropertyDetails();
      checkWatchlist();
    }
  }, [propertyId]);

  const loadPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getPropertyById(propertyId);
      if (response.data.success) {
        setProperty(response.data.data);
      }
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWatchlist = async () => {
    if (!currentUser) return;
    try {
      const response = await watchlistAPI.checkPropertyInWatchlist(currentUser.user_id, propertyId);
      if (response.data.success && response.data.data) {
        setInWatchlist(response.data.data.inWatchlist || false);
      }
    } catch (error) {
      console.error('Error checking watchlist:', error);
    }
  };

  const toggleWatchlist = async () => {
    if (!currentUser) {
      alert('Please select a user first');
      return;
    }

    try {
      if (inWatchlist) {
        await watchlistAPI.removeFromWatchlist(property.property_id);
        setInWatchlist(false);
      } else {
        await watchlistAPI.addToWatchlist({
          user_id: currentUser.user_id,
          property_id: property.property_id
        });
        setInWatchlist(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading property details...</div>;
  }

  if (!property) {
    return (
      <div className="error-state">
        <h2>Property Not Found</h2>
        <button onClick={() => onNavigate('search')}>Back to Search</button>
      </div>
    );
  }

  return (
    <div className="property-details-page">
      <nav className="breadcrumb">
        <button onClick={() => onNavigate('search')}>Back to Search</button>
      </nav>

      <div className="breadcrumb-trail">
        <button onClick={() => onNavigate('home')}>Home</button> / 
        <button onClick={() => onNavigate('search')}>Search</button> / Property Details
      </div>

      <div className="property-header">
        <div className="property-title">
          <h1>{property.civic_address || 'Address Not Available'}</h1>
          <p className="neighborhood">{property.neighborhood_name}</p>
        </div>
        <button 
          onClick={toggleWatchlist}
          className={inWatchlist ? 'watchlist-btn active' : 'watchlist-btn'}
        >
          {inWatchlist ? '⭐ In Watchlist' : '☆ Add to Watchlist'}
        </button>
      </div>

      <div className="property-content">
        <section className="property-info">
          <h2>Property Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>PID</label>
              <span>{property.pid}</span>
            </div>
            <div className="info-item">
              <label>Legal Type</label>
              <span>{property.legal_type || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Folio</label>
              <span>{property.folio || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Property Type</label>
              <span>{property.property_type || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Zoning</label>
              <span>{property.zoning_district || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Zone Category</label>
              <span>{property.zone_category || 'N/A'}</span>
            </div>
          </div>
        </section>

        <section className="valuation-section">
          <h2>Property Valuation</h2>
          <div className="valuation-grid">
            <div className="valuation-card">
              <h3>Current Land Value</h3>
              <p className="value">${property.current_land_value?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="valuation-card">
              <h3>Current Improvement Value</h3>
              <p className="value">${property.current_improvement_value?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="valuation-card">
              <h3>Total Property Value</h3>
              <p className="value">${property.current_total_value?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="valuation-card">
              <h3>Tax Levy</h3>
              <p className="value">${property.tax_levy?.toLocaleString() || 'N/A'}</p>
            </div>
          </div>
        </section>

        <section className="previous-values-section">
          <h2>Previous Year Values</h2>
          <div className="previous-values-grid">
            <div className="value-item">
              <label>Previous Land Value</label>
              <span>${property.previous_land_value?.toLocaleString() || 'N/A'}</span>
            </div>
            <div className="value-item">
              <label>Previous Improvement Value</label>
              <span>${property.previous_improvement_value?.toLocaleString() || 'N/A'}</span>
            </div>
            <div className="value-item">
              <label>Previous Total Value</label>
              <span>${property.previous_total_value?.toLocaleString() || 'N/A'}</span>
            </div>
          </div>
        </section>

        <section className="location-section">
          <h2>Location Details</h2>
          <div className="location-grid">
            <div className="location-item">
              <label>Neighborhood</label>
              <span>{property.neighborhood_name}</span>
            </div>
            <div className="location-item">
              <label>Coordinates</label>
              <span>{property.coordinates || 'N/A'}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="property-actions">
        <button onClick={() => onNavigate('search')} className="btn-secondary">Back to Search</button>
        {currentUser && (
          <button onClick={() => onNavigate('dashboard')} className="btn-primary">View Dashboard</button>
        )}
      </div>
    </div>
  );
}

export default PropertyDetailsPage;
