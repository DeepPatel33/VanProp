import '../styles/PropertyCard.css';

function PropertyCard({ property, currentUser, onNavigate }) {
  const formatValue = (value) => {
    if (!value) return 'N/A';
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="property-card">
      <div className="property-card-header">
        <h3>{property.civic_address}</h3>
        <span className="neighborhood-badge">{property.neighborhood_name}</span>
      </div>
      
      <div className="property-card-body">
        <div className="property-value">
          <label>Current Land Value</label>
          <span className="value">{formatValue(property.current_land_value)}</span>
        </div>
        
        <div className="property-details">
          <div className="detail-row">
            <span className="label">PID:</span>
            <span className="value">{property.pid}</span>
          </div>
          <div className="detail-row">
            <span className="label">Type:</span>
            <span className="value">{property.legal_type}</span>
          </div>
          {property.year_built && (
            <div className="detail-row">
              <span className="label">Built:</span>
              <span className="value">{property.year_built}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="property-card-footer">
        <button 
          onClick={() => onNavigate('property-details', property.property_id)}
          className="view-details-btn"
        >
          View Details →
        </button>
      </div>
    </div>
  );
}

export default PropertyCard;
