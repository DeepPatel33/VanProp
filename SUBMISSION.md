# VanProperty Insights - Project Submission

**Student:** Deep Patel  
**Program:** BCIT Web and Mobile Development  
**Courses:** WMDD 4921 (Database Design) & WMDD 4936 (Full-Stack Web Development)  
**Instructor:** Professor Jordan Miller  
**Submission Date:** December 2024

---

## Project Overview

VanProperty Insights is a full-stack web application that allows users to explore, search, and track Vancouver property tax data. The application uses real data from the City of Vancouver's Open Data Portal.

### Key Features
- **Property Search:** Advanced filtering by neighborhood, price range, and property type
- **Property Details:** Comprehensive view of individual property information
- **Watchlist:** Save favorite properties for quick access
- **Saved Searches:** Store frequently used search criteria
- **Analytics:** View neighborhood statistics and property trends

---

## Technology Stack

### Backend
- **Node.js** with **Express.js** (v4.18.2)
- **SQLite3** (better-sqlite3 v9.2.2)
- **MVC Architecture**
- RESTful API design

### Frontend
- **React** (v18.x)
- **Vite** build tool
- **Axios** for HTTP requests
- **NO React Router** (State-based navigation as per requirements)

### Database
- **SQLite** with 7 normalized tables (Third Normal Form)
- **500 properties** from Vancouver Open Data API
- **35 neighborhoods**
- **3 sample users**

---

## Project Structure
```
VanProp/
├── express/                 # Backend application
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── db/             # Database configuration
│   │   ├── data/           # SQLite database file
│   │   └── server.js       # Express server
│   └── package.json
│
├── react/                   # Frontend application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── styles/         # CSS files
│   └── package.json
│
├── data.js                  # Data population script
├── schema.sql              # Database schema
├── queries.sql             # Sample queries
└── README.md               # Setup instructions
```

---

## Database Schema

### Tables (7)
1. **users** - User accounts
2. **properties** - Property information
3. **neighborhoods** - Neighborhood data
4. **tax_levies** - Tax levy information
5. **watchlist** - User watchlists
6. **saved_searches** - Saved search criteria
7. **property_views** - View tracking

**Normalization:** All tables are in Third Normal Form (3NF)

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Setup
```bash
# Navigate to backend directory
cd express

# Install dependencies
npm install

# Start backend server
npm run dev
```
Backend runs on: `http://localhost:5000`

### Frontend Setup
```bash
# Navigate to frontend directory
cd react

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend runs on: `http://localhost:3000`

### Database Population
```bash
# From project root
node data.js
```
This fetches 500 properties from Vancouver Open Data API and populates the database.

---

## API Endpoints

### Properties
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get single property
- `GET /api/properties/top/:limit` - Get top properties by value
- `GET /api/properties/neighborhoods` - Get all neighborhoods
- `GET /api/properties/stats/neighborhoods` - Get neighborhood statistics

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user

### Watchlist
- `GET /api/watchlist/user/:userId` - Get user's watchlist
- `POST /api/watchlist` - Add property to watchlist
- `DELETE /api/watchlist/:id` - Remove from watchlist

### Saved Searches
- `GET /api/saved-searches/user/:userId` - Get user's saved searches
- `POST /api/saved-searches` - Create saved search
- `PUT /api/saved-searches/:id/execute` - Update execution count
- `DELETE /api/saved-searches/:id` - Delete saved search

---

## Design Principles

### Minimalistic Design
- Clean white backgrounds
- Simple black text (#1a1a1a)
- Subtle gray borders (#e0e0e0)
- Professional typography
- No unnecessary decorations

### Code Quality
- Professional naming conventions
- Comprehensive error handling
- Clean separation of concerns (MVC)
- No decorative comments
- Consistent code style

---

## Academic Requirements Compliance

**Database Design (WMDD 4921)**
- SQLite database implementation
- 7 normalized tables (3NF)
- Proper foreign key relationships
- Indexes for performance
- Views and triggers

**Full-Stack Development (WMDD 4936)**
- Express.js RESTful API
- React frontend
- Complete CRUD operations
- NO React Router (state-based navigation)
- Professional code standards

---

## Testing

### Backend Testing
- All API endpoints tested with Thunder Client
- 200 OK responses confirmed
- CORS configuration verified

### Frontend Testing
- All pages functional
- Navigation working correctly
- API integration successful
- Responsive design verified

---

## Known Limitations

- Database contains sample data (500 properties)
- Authentication not implemented (user selection via dropdown)
- Limited to Vancouver properties only

---

## Future Enhancements

- User authentication system
- Real-time data updates
- Property comparison feature
- Email notifications for watchlist updates
- Mobile app version

---

## Credits

- **Data Source:** City of Vancouver Open Data Portal
- **Student:** Deep Patel
- **Course Instructor:** Professor Jordan Miller
- **Institution:** British Columbia Institute of Technology (BCIT)

---

## License

This project is submitted for academic purposes as part of BCIT WMDD program requirements.

© 2024 Deep Patel | BCIT WMDD
