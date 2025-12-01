import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import { userAPI } from './services/api';
import './styles/App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      if (response.data.success) {
        setUsers(response.data.data);
        if (response.data.data.length > 0 && !currentUser) {
          setCurrentUser(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleUserChange = (e) => {
    const userId = parseInt(e.target.value);
    const user = users.find(u => u.user_id === userId);
    setCurrentUser(user);
  };

  const navigateTo = (page, propertyId = null) => {
    setCurrentPage(page);
    if (propertyId) {
      setSelectedPropertyId(propertyId);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage currentUser={currentUser} onNavigate={navigateTo} />;
      case 'search':
        return <SearchPage currentUser={currentUser} onNavigate={navigateTo} />;
      case 'property-details':
        return <PropertyDetailsPage currentUser={currentUser} propertyId={selectedPropertyId} onNavigate={navigateTo} />;
      case 'dashboard':
        return <DashboardPage currentUser={currentUser} onNavigate={navigateTo} />;
      default:
        return <HomePage currentUser={currentUser} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <h1>VanProperty Insights</h1>
            <p>Vancouver Property Tax Explorer</p>
          </div>
          
          <nav className="main-nav">
            <button onClick={() => navigateTo('home')} className={currentPage === 'home' ? 'active' : ''}>Home</button>
            <button onClick={() => navigateTo('search')} className={currentPage === 'search' ? 'active' : ''}>Search</button>
            <button onClick={() => navigateTo('dashboard')} className={currentPage === 'dashboard' ? 'active' : ''}>Dashboard</button>
          </nav>

          {users.length > 0 && (
            <div className="user-selector">
              <label>User: </label>
              <select value={currentUser?.user_id || ''} onChange={handleUserChange}>
                {users.map(user => (
                  <option key={user.user_id} value={user.user_id}>{user.username}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        {renderPage()}
      </main>

    </div>
  );
}

export default App;
