require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const propertyRoutes = require('./routes/propertyRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const savedSearchRoutes = require('./routes/savedSearchRoutes');
const userRoutes = require('./routes/userRoutes');

// Import database config
const { getDb } = require('./db/config');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = process.env.API_PREFIX || '/api';

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Initialize database connection
try {
    getDb();
    console.log('Database initialized');
} catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
}

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'VanProperty Insights API',
        version: '1.0.0',
        endpoints: {
            properties: `${API_PREFIX}/properties`,
            watchlist: `${API_PREFIX}/watchlist`,
            savedSearches: `${API_PREFIX}/saved-searches`,
            users: `${API_PREFIX}/users`
        }
    });
});

// API status endpoint
app.get(`${API_PREFIX}/status`, (req, res) => {
    res.json({
        success: true,
        status: 'online',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use(`${API_PREFIX}/properties`, propertyRoutes);
app.use(`${API_PREFIX}/watchlist`, watchlistRoutes);
app.use(`${API_PREFIX}/saved-searches`, savedSearchRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const server = app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`API Base URL: http://localhost:${PORT}${API_PREFIX}`);
console.log('\nAvailable Endpoints:');
console.log(`   GET  ${API_PREFIX}/properties          - Get all properties`);
console.log(`   GET  ${API_PREFIX}/properties/:id      - Get property by ID`);
console.log(`   GET  ${API_PREFIX}/watchlist/:userId   - Get user's watchlist`);
console.log(`   POST ${API_PREFIX}/watchlist           - Add to watchlist`);
console.log(`   GET  ${API_PREFIX}/saved-searches/:userId - Get saved searches`);
console.log(`   GET  ${API_PREFIX}/users               - Get all users`);
console.log('\nTest the API:');
console.log(`   curl http://localhost:${PORT}${API_PREFIX}/status`);
console.log('\nPress Ctrl+C to stop the server\n');
});

process.on('SIGTERM', () => {
    console.log('\n SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        const { closeDb } = require('./db/config');
        closeDb();
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n\nSIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        const { closeDb } = require('./db/config');
        closeDb();
        process.exit(0);
    });
});

module.exports = app;
