-- ============================================================================
-- VANPROPERTY INSIGHTS - SQLite Database Schema
-- Course: WMDD 4921 Database Design & WMDD 4936 Full-Stack Development
-- Dataset: Vancouver Property Tax Report
-- ============================================================================
-- This schema implements a normalized relational database for Vancouver
-- property tax data with user features (watchlist, saved searches)
-- ============================================================================

-- Drop existing tables if they exist (for clean rebuild)
DROP TABLE IF EXISTS property_comparisons;
DROP TABLE IF EXISTS saved_searches;
DROP TABLE IF EXISTS watchlist;
DROP TABLE IF EXISTS tax_history;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS neighborhoods;

-- Drop existing views and triggers
DROP VIEW IF EXISTS property_summary_view;
DROP TRIGGER IF EXISTS update_watchlist_timestamp;
DROP TRIGGER IF EXISTS update_user_timestamp;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_properties_address;
DROP INDEX IF EXISTS idx_properties_neighborhood;
DROP INDEX IF EXISTS idx_tax_history_year;
DROP INDEX IF EXISTS idx_watchlist_user;

-- ============================================================================
-- TABLE 1: NEIGHBORHOODS
-- ============================================================================
-- Stores unique neighborhood information extracted from property data
-- Normalized to avoid redundancy in properties table
-- ============================================================================
CREATE TABLE neighborhoods (
    neighborhood_id INTEGER PRIMARY KEY AUTOINCREMENT,
    neighborhood_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (LENGTH(neighborhood_name) > 0)
);

-- ============================================================================
-- TABLE 2: PROPERTIES
-- ============================================================================
-- Main table storing property information from Vancouver Open Data
-- Each property has a unique PID (Property Identifier)
-- ============================================================================
CREATE TABLE properties (
    property_id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Property Identification (from Vancouver dataset)
    pid TEXT NOT NULL UNIQUE,  -- Property Identifier (9-digit)
    civic_address TEXT NOT NULL,
    legal_type TEXT,
    
    -- Location Information
    neighborhood_id INTEGER NOT NULL,
    postal_code TEXT,
    coordinates_lat REAL,
    coordinates_lon REAL,
    
    -- Property Details
    property_type TEXT,  -- e.g., "Single Family Dwelling", "Strata"
    zoning_classification TEXT,
    land_area REAL,  -- in square meters
    
    -- Assessment Values (current year)
    current_land_value REAL NOT NULL,
    current_improvement_value REAL NOT NULL,
    current_total_value REAL GENERATED ALWAYS AS (current_land_value + current_improvement_value) STORED,
    
    -- Tax Information (current year)
    tax_levy REAL,
    current_year INTEGER NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(neighborhood_id) ON DELETE RESTRICT,
    
    -- Constraints
    CHECK (current_land_value >= 0),
    CHECK (current_improvement_value >= 0),
    CHECK (tax_levy >= 0),
    CHECK (current_year >= 2000 AND current_year <= 2100),
    CHECK (LENGTH(civic_address) > 0),
    CHECK (coordinates_lat IS NULL OR (coordinates_lat >= 49.0 AND coordinates_lat <= 49.5)),
    CHECK (coordinates_lon IS NULL OR (coordinates_lon >= -123.3 AND coordinates_lon <= -123.0))
);

-- ============================================================================
-- TABLE 3: TAX_HISTORY
-- ============================================================================
-- Stores historical tax assessment data for properties
-- Allows tracking year-over-year changes in property values
-- ============================================================================
CREATE TABLE tax_history (
    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    
    -- Assessment Year
    assessment_year INTEGER NOT NULL,
    
    -- Historical Values
    land_value REAL NOT NULL,
    improvement_value REAL NOT NULL,
    total_value REAL GENERATED ALWAYS AS (land_value + improvement_value) STORED,
    
    -- Tax Information
    tax_levy REAL,
    
    -- Year-over-year change calculations
    value_change_percent REAL,
    value_change_amount REAL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    
    -- Constraints
    UNIQUE (property_id, assessment_year),  -- One record per property per year
    CHECK (land_value >= 0),
    CHECK (improvement_value >= 0),
    CHECK (tax_levy IS NULL OR tax_levy >= 0),
    CHECK (assessment_year >= 2000 AND assessment_year <= 2100)
);

-- ============================================================================
-- TABLE 4: USERS
-- ============================================================================
-- NEW DATA: User accounts for the application
-- Not part of Vancouver dataset - added for application functionality
-- ============================================================================
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- User Information
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    
    -- User Preferences
    preferred_neighborhoods TEXT,  -- JSON array of neighborhood names
    price_range_min REAL,
    price_range_max REAL,
    
    -- Account Status
    account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended')),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    -- Constraints
    CHECK (LENGTH(username) >= 3),
    CHECK (LENGTH(email) >= 5 AND email LIKE '%_@__%.__%'),
    CHECK (LENGTH(full_name) > 0),
    CHECK (price_range_min IS NULL OR price_range_min >= 0),
    CHECK (price_range_max IS NULL OR price_range_max >= price_range_min)
);

-- ============================================================================
-- TABLE 5: WATCHLIST
-- ============================================================================
-- NEW DATA: Users can save properties to their watchlist
-- Not part of Vancouver dataset - added for application functionality
-- Junction table implementing many-to-many relationship
-- ============================================================================
CREATE TABLE watchlist (
    watchlist_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    
    -- User Notes
    notes TEXT,
    
    -- Tags for organization
    tags TEXT,  -- JSON array, e.g., ["potential-buy", "investment"]
    
    -- Priority
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),  -- 1=highest, 5=lowest
    
    -- Metadata
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    
    -- Constraints
    UNIQUE (user_id, property_id)  -- User can't add same property twice
);

-- ============================================================================
-- TABLE 6: SAVED_SEARCHES
-- ============================================================================
-- NEW DATA: Users can save their search criteria for quick access
-- Not part of Vancouver dataset - added for application functionality
-- ============================================================================
CREATE TABLE saved_searches (
    search_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    -- Search Details
    search_name TEXT NOT NULL,
    search_criteria TEXT NOT NULL,  -- JSON object with search parameters
    
    -- Search Metadata
    result_count INTEGER DEFAULT 0,
    last_executed TIMESTAMP,
    execution_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Constraints
    CHECK (LENGTH(search_name) > 0),
    CHECK (LENGTH(search_criteria) > 0),
    CHECK (result_count >= 0),
    CHECK (execution_count >= 0)
);

-- ============================================================================
-- TABLE 7: PROPERTY_COMPARISONS
-- ============================================================================
-- NEW DATA: Track which properties users compare (for analytics)
-- Not part of Vancouver dataset - added for application functionality
-- ============================================================================
CREATE TABLE property_comparisons (
    comparison_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    -- Properties being compared (supports up to 4 properties)
    property_1_id INTEGER NOT NULL,
    property_2_id INTEGER,
    property_3_id INTEGER,
    property_4_id INTEGER,
    
    -- Comparison Notes
    comparison_notes TEXT,
    
    -- Metadata
    compared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (property_1_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (property_2_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (property_3_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (property_4_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    
    -- Constraints
    CHECK (property_2_id IS NULL OR property_2_id != property_1_id),
    CHECK (property_3_id IS NULL OR (property_3_id != property_1_id AND property_3_id != property_2_id)),
    CHECK (property_4_id IS NULL OR (property_4_id != property_1_id AND property_4_id != property_2_id AND property_4_id != property_3_id))
);

-- ============================================================================
-- INDEXES (Required for WMDD 4921)
-- ============================================================================
-- Indexes optimize search performance for frequently queried columns
-- ============================================================================

-- Index for property address searches (most common query)
CREATE INDEX idx_properties_address ON properties(civic_address);

-- Index for neighborhood filtering
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood_id);

-- Index for tax history year queries (for historical analysis)
CREATE INDEX idx_tax_history_year ON tax_history(assessment_year);

-- Index for user watchlist queries
CREATE INDEX idx_watchlist_user ON watchlist(user_id);

-- Composite index for property value range searches
CREATE INDEX idx_properties_value ON properties(current_total_value, current_year);

-- Index for property type filtering
CREATE INDEX idx_properties_type ON properties(property_type);

-- ============================================================================
-- VIEW (Required for WMDD 4921)
-- ============================================================================
-- Creates a denormalized view combining property and neighborhood data
-- Makes queries simpler and faster for common use cases
-- ============================================================================
CREATE VIEW property_summary_view AS
SELECT 
    p.property_id,
    p.pid,
    p.civic_address,
    n.neighborhood_name,
    p.property_type,
    p.zoning_classification,
    p.current_land_value,
    p.current_improvement_value,
    p.current_total_value,
    p.tax_levy,
    p.current_year,
    p.land_area,
    p.coordinates_lat,
    p.coordinates_lon,
    
    -- Calculate price per square meter if land area is available
    CASE 
        WHEN p.land_area > 0 THEN ROUND(p.current_total_value / p.land_area, 2)
        ELSE NULL 
    END as price_per_sqm,
    
    -- Flag high-value properties (over $2M)
    CASE 
        WHEN p.current_total_value > 2000000 THEN 'High Value'
        WHEN p.current_total_value > 1000000 THEN 'Medium Value'
        ELSE 'Standard Value'
    END as value_category,
    
    -- Count historical records
    (SELECT COUNT(*) FROM tax_history th WHERE th.property_id = p.property_id) as history_count,
    
    p.created_at,
    p.updated_at
FROM properties p
INNER JOIN neighborhoods n ON p.neighborhood_id = n.neighborhood_id;

-- ============================================================================
-- TRIGGERS (Required for WMDD 4921)
-- ============================================================================

-- Trigger 1: Auto-update watchlist timestamp when notes are modified
CREATE TRIGGER update_watchlist_timestamp
AFTER UPDATE OF notes, tags, priority ON watchlist
FOR EACH ROW
BEGIN
    UPDATE watchlist 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE watchlist_id = NEW.watchlist_id;
END;

-- Trigger 2: Auto-update user timestamp on any user modification
CREATE TRIGGER update_user_timestamp
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE user_id = NEW.user_id;
END;

-- Trigger 3: Validate property values before insert/update
CREATE TRIGGER validate_property_values
BEFORE INSERT ON properties
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN NEW.current_land_value < 0 THEN
            RAISE(ABORT, 'Land value cannot be negative')
        WHEN NEW.current_improvement_value < 0 THEN
            RAISE(ABORT, 'Improvement value cannot be negative')
        WHEN NEW.tax_levy < 0 THEN
            RAISE(ABORT, 'Tax levy cannot be negative')
    END;
END;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================
-- Insert sample neighborhoods
INSERT INTO neighborhoods (neighborhood_name, description) VALUES
    ('Downtown', 'Central business district'),
    ('Kitsilano', 'Beachside residential neighborhood'),
    ('West End', 'Dense residential area near downtown'),
    ('Mount Pleasant', 'Hip, artsy neighborhood'),
    ('Fairview', 'Central neighborhood with shopping');

-- Insert sample users
INSERT INTO users (username, email, full_name, account_status) VALUES
    ('john_buyer', 'john@example.com', 'John Smith', 'active'),
    ('sarah_investor', 'sarah@example.com', 'Sarah Johnson', 'active'),
    ('mike_resident', 'mike@example.com', 'Mike Chen', 'active');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
-- This schema is normalized to Third Normal Form (3NF):
-- - 1NF: All attributes contain atomic values
-- - 2NF: No partial dependencies (all non-key attributes depend on entire PK)
-- - 3NF: No transitive dependencies (non-key attributes don't depend on other non-key attributes)
--
-- Functional Dependencies:
-- neighborhoods: neighborhood_id → neighborhood_name, description
-- properties: property_id → all property attributes
-- tax_history: (property_id, assessment_year) → historical values
-- users: user_id → all user attributes
-- watchlist: (user_id, property_id) → notes, tags, priority
-- saved_searches: search_id → user_id, search details
-- property_comparisons: comparison_id → user_id, property_ids, notes
-- ============================================================================
