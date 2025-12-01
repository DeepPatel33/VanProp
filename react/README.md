# VanProperty Insights - React Frontend

React frontend for the VanProperty Insights application.

## Features

- 🏠 Property search with advanced filters
- 📊 Neighborhood statistics
- ⭐ Personal watchlist
- 💾 Saved searches
- 📱 Responsive design
- 🎨 Modern UI with gradient styling

## Tech Stack

- React 18
- React Router DOM
- Axios for API calls
- Vite as build tool
- CSS3 with modern styling

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Development

The development server runs on port 3000 and proxies API requests to the Express backend on port 5000.

### Project Structure

```
src/
├── components/        # Reusable components
│   ├── PropertyCard.jsx
│   └── SearchFilters.jsx
├── pages/            # Page components
│   ├── HomePage.jsx
│   ├── SearchPage.jsx
│   ├── PropertyDetailsPage.jsx
│   └── DashboardPage.jsx
├── services/         # API service layer
│   └── api.js
├── styles/           # CSS files
│   ├── index.css
│   ├── App.css
│   ├── HomePage.css
│   ├── SearchPage.css
│   ├── PropertyDetailsPage.css
│   ├── DashboardPage.css
│   ├── PropertyCard.css
│   └── SearchFilters.css
├── App.jsx           # Main app component
└── main.jsx          # Entry point
```

## Pages

### Home Page
- Featured properties
- Database statistics
- Neighborhood browser
- Feature highlights

### Search Page
- Advanced property search
- Filters for neighborhood, price, type
- Saved search management
- Results grid

### Property Details
- Complete property information
- Assessment history
- Tax records
- Add to watchlist

### Dashboard
- User watchlist management
- Saved searches
- Statistics
- Edit notes and preferences

## API Integration

The frontend connects to the Express backend API at `http://localhost:5000/api`

All API calls are handled through the service layer in `src/services/api.js`

## Environment

Create a `.env` file if you need to customize:

```
VITE_API_URL=http://localhost:5000/api
```

## Running with Backend

1. Start the Express backend first:
   ```bash
   cd ../express
   npm run dev
   ```

2. Start the React frontend:
   ```bash
   npm run dev
   ```

3. Open browser at http://localhost:3000

## Author

Deep Patel  
BCIT Web and Mobile Development Program  
WMDD 4936 - Full-Stack Web Development
