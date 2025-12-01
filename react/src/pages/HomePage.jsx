import { useState, useEffect } from 'react';
import { propertyAPI } from '../services/api';
import '../styles/HomePage.css';

function HomePage({ currentUser, onNavigate }) {
  const [topProperties, setTopProperties] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [neighborhoodStats, setNeighborhoodStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [propsRes, neighRes, statsRes] = await Promise.all([
        propertyAPI.getTopProperties(6),
        propertyAPI.getNeighborhoods(),
        propertyAPI.getNeighborhoodStats()
      ]);

      if (propsRes.data.success) {
        setTopProperties(propsRes.data.data);
      }
      if (neighRes.data.success) {
        setNeighborhoods(neighRes.data.data.slice(0, 12));
      }
      if (statsRes.data.success) {
        setNeighborhoodStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalProperties = neighborhoodStats.reduce((sum, n) => sum + (n.property_count || 0), 0);
  const avgValue = neighborhoodStats.length > 0 
    ? neighborhoodStats.reduce((sum, n) => sum + (parseFloat(n.avg_value) || 0), 0) / neighborhoodStats.length 
    : 0;
  const totalValue = neighborhoodStats.reduce((sum, n) => sum + (n.property_count * n.avg_value || 0), 0);

  return (
    <div className="home-page">
      <section className="hero-section">
        <h2>Explore Vancouver Property Tax Data</h2>
        <p>Search, compare, and track properties across Vancouver neighborhoods</p>
        <button onClick={() => onNavigate('search')} className="cta-button">Start Searching</button>
      </section>

      <section className="stats-section">
        <h3>Database Overview</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <h4>{totalProperties}</h4>
            <p>Total Properties</p>
          </div>
          <div className="stat-card">
            <h4>{neighborhoods.length}</h4>
            <p>Neighborhoods</p>
          </div>
          <div className="stat-card">
            <h4>${(avgValue / 1000000).toFixed(2)}M</h4>
            <p>Avg. Property Value</p>
          </div>
          <div className="stat-card">
            <h4>${(totalValue / 1000000000).toFixed(2)}B</h4>
            <p>Total Value</p>
          </div>
        </div>
      </section>

      <section className="top-properties-section">
        <h3>Top Properties by Value</h3>
        <div className="properties-grid">
          {topProperties.map(property => (
            <div key={property.property_id} className="property-card">
              <h4>{property.civic_address || 'Address Not Available'}</h4>
              <p className="neighborhood">{property.neighborhood_name}</p>
              <p className="value">Current Land Value</p>
              <p className="amount">N/A</p>
              <div className="property-details">
                <span>PID: {property.pid}</span>
                <span>Type: </span>
              </div>
              <button onClick={() => onNavigate('property-details', property.property_id)} className="view-details-btn">
                View Details →
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => onNavigate('search')} className="view-all-link">View All Properties →</button>
      </section>

      <section className="neighborhoods-section">
        <h3>Explore by Neighborhood</h3>
        <div className="neighborhoods-grid">
          {neighborhoods.map((neighborhood, index) => (
            <button
              key={index}
              onClick={() => onNavigate('search')}
              className="neighborhood-badge"
            >
              {neighborhood.neighborhood_name}
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}

export default HomePage;
