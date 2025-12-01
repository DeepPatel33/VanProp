-- ============================================================================
-- VANPROPERTY INSIGHTS - SQL QUERIES
-- Course: WMDD 4921 Database Design
-- ============================================================================
-- This file demonstrates all required query types for the term project:
-- - Filtering (WHERE, HAVING)
-- - Order and Limit
-- - Aggregation and Grouping
-- - Inserts
-- - Joins
-- - Updates and Deletes
-- - Transactions
-- ============================================================================

-- ============================================================================
-- 1. FILTERING WITH WHERE
-- ============================================================================
-- Use Case: User searches for properties in a specific neighborhood with value range
-- Application Feature: Property Search Page

-- Query 1a: Find all properties in Kitsilano between $1M and $2M
SELECT 
    p.civic_address,
    p.property_type,
    p.current_total_value,
    n.neighborhood_name
FROM properties p
JOIN neighborhoods n ON p.neighborhood_id = n.neighborhood_id
WHERE n.neighborhood_name = 'Kitsilano'
    AND p.current_total_value BETWEEN 1000000 AND 2000000
ORDER BY p.current_total_value DESC;

-- Query 1b: Find single-family homes with land area over 500 sqm
SELECT 
    civic_address,
    land_area,
    current_total_value,
    zoning_classification
FROM properties
WHERE property_type = 'Single Family Dwelling'
    AND land_area > 500
    AND current_year = 2024
ORDER BY land_area DESC
LIMIT 20;

-- Query 1c: Complex filtering - Properties with specific criteria
SELECT 
    p.pid,
    p.civic_address,
    p.current_total_value,
    p.tax_levy
FROM properties p
WHERE p.current_land_value > 800000
    AND p.current_improvement_value > 500000
    AND p.tax_levy IS NOT NULL
    AND p.coordinates_lat IS NOT NULL;

-- ============================================================================
-- 2. FILTERING WITH HAVING (After Aggregation)
-- ============================================================================
-- Use Case: Find neighborhoods with average property values over threshold
-- Application Feature: Neighborhood Analytics Dashboard

-- Query 2a: Neighborhoods with average property value over $1.5M
SELECT 
    n.neighborhood_name,
    COUNT(p.property_id) as property_count,
    ROUND(AVG(p.current_total_value), 2) as avg_property_value,
    ROUND(MIN(p.current_total_value), 2) as min_value,
    ROUND(MAX(p.current_total_value), 2) as max_value
FROM neighborhoods n
JOIN properties p ON n.neighborhood_id = p.neighborhood_id
GROUP BY n.neighborhood_id, n.neighborhood_name
HAVING AVG(p.current_total_value) > 1500000
ORDER BY avg_property_value DESC;

-- Query 2b: Users with more than 5 properties in watchlist
SELECT 
    u.username,
    u.full_name,
    COUNT(w.property_id) as watchlist_count
FROM users u
JOIN watchlist w ON u.user_id = w.user_id
GROUP BY u.user_id, u.username, u.full_name
HAVING COUNT(w.property_id) > 5
ORDER BY watchlist_count DESC;

-- ============================================================================
-- 3. ORDER AND LIMIT
-- ============================================================================
-- Use Case: Display top properties, recent additions, pagination
-- Application Feature: Property Listings, Top Properties Page

-- Query 3a: Top 10 most expensive properties
SELECT 
    civic_address,
    property_type,
    current_total_value,
    tax_levy
FROM property_summary_view
ORDER BY current_total_value DESC
LIMIT 10;

-- Query 3b: Most recently added properties to watchlists
SELECT 
    u.username,
    p.civic_address,
    w.notes,
    w.added_at
FROM watchlist w
JOIN users u ON w.user_id = u.user_id
JOIN properties p ON w.property_id = p.property_id
ORDER BY w.added_at DESC
LIMIT 15;

-- Query 3c: Properties sorted by tax levy (highest to lowest)
SELECT 
    pid,
    civic_address,
    current_total_value,
    tax_levy,
    ROUND((tax_levy / current_total_value * 100), 3) as tax_rate_percent
FROM properties
WHERE tax_levy IS NOT NULL
ORDER BY tax_levy DESC
LIMIT 20;

-- ============================================================================
-- 4. AGGREGATION AND GROUPING
-- ============================================================================
-- Use Case: Statistics, analytics, dashboard metrics
-- Application Feature: Analytics Dashboard, Reports

-- Query 4a: Property statistics by neighborhood
SELECT 
    n.neighborhood_name,
    COUNT(p.property_id) as total_properties,
    ROUND(AVG(p.current_total_value), 2) as avg_value,
    ROUND(AVG(p.current_land_value), 2) as avg_land_value,
    ROUND(AVG(p.current_improvement_value), 2) as avg_improvement_value,
    ROUND(SUM(p.tax_levy), 2) as total_tax_revenue
FROM neighborhoods n
LEFT JOIN properties p ON n.neighborhood_id = p.neighborhood_id
GROUP BY n.neighborhood_id, n.neighborhood_name
ORDER BY total_properties DESC;

-- Query 4b: Property type distribution and average values
SELECT 
    property_type,
    COUNT(*) as count,
    ROUND(AVG(current_total_value), 2) as avg_value,
    ROUND(MIN(current_total_value), 2) as min_value,
    ROUND(MAX(current_total_value), 2) as max_value
FROM properties
WHERE property_type IS NOT NULL
GROUP BY property_type
ORDER BY count DESC;

-- Query 4c: User activity statistics
SELECT 
    u.username,
    COUNT(DISTINCT w.property_id) as watchlist_count,
    COUNT(DISTINCT s.search_id) as saved_searches_count,
    COUNT(DISTINCT c.comparison_id) as comparisons_count
FROM users u
LEFT JOIN watchlist w ON u.user_id = w.user_id
LEFT JOIN saved_searches s ON u.user_id = s.user_id
LEFT JOIN property_comparisons c ON u.user_id = c.user_id
GROUP BY u.user_id, u.username
ORDER BY watchlist_count DESC;

-- Query 4d: Year-over-year property value analysis
SELECT 
    th.assessment_year,
    COUNT(DISTINCT th.property_id) as properties_assessed,
    ROUND(AVG(th.total_value), 2) as avg_total_value,
    ROUND(AVG(th.land_value), 2) as avg_land_value,
    ROUND(AVG(th.improvement_value), 2) as avg_improvement_value
FROM tax_history th
GROUP BY th.assessment_year
ORDER BY th.assessment_year DESC;

-- ============================================================================
-- 5. INSERT OPERATIONS
-- ============================================================================
-- Use Case: Adding new users, properties to watchlist, saving searches
-- Application Feature: User Registration, Watchlist Management, Search Saving

-- Query 5a: Insert a new user
INSERT INTO users (username, email, full_name, account_status)
VALUES ('deep_student', 'deep@example.com', 'Deep Patel', 'active');

-- Query 5b: Insert a new property (from Vancouver data)
INSERT INTO properties (
    pid, 
    civic_address, 
    neighborhood_id, 
    property_type,
    current_land_value,
    current_improvement_value,
    tax_levy,
    current_year
) VALUES (
    '123-456-789',
    '123 Main Street',
    1,  -- Downtown neighborhood_id
    'Single Family Dwelling',
    1200000,
    800000,
    8500.00,
    2024
);

-- Query 5c: Add property to user's watchlist
INSERT INTO watchlist (user_id, property_id, notes, priority)
VALUES (
    1,  -- user_id
    1,  -- property_id
    'Great location, close to transit',
    2   -- High priority
);

-- Query 5d: Save a user's search criteria
INSERT INTO saved_searches (user_id, search_name, search_criteria)
VALUES (
    1,
    'Downtown Condos Under 1M',
    '{"neighborhood": "Downtown", "property_type": "Strata", "max_value": 1000000}'
);

-- Query 5e: Insert historical tax data
INSERT INTO tax_history (
    property_id,
    assessment_year,
    land_value,
    improvement_value,
    tax_levy
) VALUES (
    1,
    2023,
    1100000,
    750000,
    8200.00
);

-- ============================================================================
-- 6. JOINS (Multiple Types)
-- ============================================================================
-- Use Case: Combining data from multiple tables
-- Application Feature: Property Details, User Dashboard, Reports

-- Query 6a: INNER JOIN - Get user watchlists with property details
SELECT 
    u.username,
    u.email,
    p.civic_address,
    p.current_total_value,
    n.neighborhood_name,
    w.notes,
    w.priority,
    w.added_at
FROM watchlist w
INNER JOIN users u ON w.user_id = u.user_id
INNER JOIN properties p ON w.property_id = p.property_id
INNER JOIN neighborhoods n ON p.neighborhood_id = n.neighborhood_id
ORDER BY u.username, w.priority;

-- Query 6b: LEFT JOIN - All properties with their historical data (if exists)
SELECT 
    p.civic_address,
    p.current_total_value as current_value,
    p.current_year,
    th.assessment_year as history_year,
    th.total_value as historical_value,
    CASE 
        WHEN th.total_value IS NOT NULL 
        THEN ROUND(((p.current_total_value - th.total_value) / th.total_value * 100), 2)
        ELSE NULL
    END as value_change_percent
FROM properties p
LEFT JOIN tax_history th ON p.property_id = th.property_id
    AND th.assessment_year = p.current_year - 1
LIMIT 50;

-- Query 6c: Multiple JOINs - Property comparison with full details
SELECT 
    pc.comparison_id,
    u.username,
    p1.civic_address as property_1,
    p1.current_total_value as value_1,
    p2.civic_address as property_2,
    p2.current_total_value as value_2,
    pc.comparison_notes,
    pc.compared_at
FROM property_comparisons pc
JOIN users u ON pc.user_id = u.user_id
JOIN properties p1 ON pc.property_1_id = p1.property_id
LEFT JOIN properties p2 ON pc.property_2_id = p2.property_id;

-- Query 6d: Self JOIN - Find properties in same neighborhood with similar values
SELECT 
    p1.civic_address as property_1,
    p1.current_total_value as value_1,
    p2.civic_address as property_2,
    p2.current_total_value as value_2,
    ABS(p1.current_total_value - p2.current_total_value) as value_difference,
    n.neighborhood_name
FROM properties p1
JOIN properties p2 ON p1.neighborhood_id = p2.neighborhood_id
    AND p1.property_id < p2.property_id
    AND ABS(p1.current_total_value - p2.current_total_value) < 100000
JOIN neighborhoods n ON p1.neighborhood_id = n.neighborhood_id
LIMIT 20;

-- ============================================================================
-- 7. UPDATE OPERATIONS
-- ============================================================================
-- Use Case: Modify existing records
-- Application Feature: Profile Updates, Property Data Corrections, Status Changes

-- Query 7a: Update user profile information
UPDATE users
SET 
    full_name = 'John Michael Smith',
    preferred_neighborhoods = '["Kitsilano", "West End"]',
    price_range_min = 800000,
    price_range_max = 1500000
WHERE username = 'john_buyer';

-- Query 7b: Update watchlist notes and priority
UPDATE watchlist
SET 
    notes = 'Perfect starter home, needs some renovation',
    priority = 1,
    tags = '["starter-home", "renovation-needed"]'
WHERE watchlist_id = 1;

-- Query 7c: Update property values (annual reassessment)
UPDATE properties
SET 
    current_land_value = 1250000,
    current_improvement_value = 850000,
    tax_levy = 8800.00,
    current_year = 2024,
    updated_at = CURRENT_TIMESTAMP
WHERE pid = '123-456-789';

-- Query 7d: Update saved search execution stats
UPDATE saved_searches
SET 
    last_executed = CURRENT_TIMESTAMP,
    execution_count = execution_count + 1,
    result_count = 45
WHERE search_id = 1;

-- Query 7e: Bulk update - Mark inactive users
UPDATE users
SET account_status = 'inactive'
WHERE last_login < date('now', '-365 days')
    AND account_status = 'active';

-- ============================================================================
-- 8. DELETE OPERATIONS
-- ============================================================================
-- Use Case: Remove records, cleanup data
-- Application Feature: Remove from Watchlist, Delete Searches, Account Deletion

-- Query 8a: Delete a property from watchlist
DELETE FROM watchlist
WHERE user_id = 1 AND property_id = 5;

-- Query 8b: Delete old saved searches (not used in 6 months)
DELETE FROM saved_searches
WHERE last_executed < date('now', '-180 days')
    OR (last_executed IS NULL AND created_at < date('now', '-180 days'));

-- Query 8c: Delete property comparisons older than 1 year
DELETE FROM property_comparisons
WHERE compared_at < date('now', '-365 days');

-- Query 8d: Delete user account (CASCADE will remove watchlist, searches, etc.)
DELETE FROM users
WHERE username = 'inactive_user' AND account_status = 'inactive';

-- ============================================================================
-- 9. TRANSACTIONS (Required for WMDD 4921)
-- ============================================================================
-- Use Case: Ensure data integrity for multi-step operations
-- Application Feature: User Registration with Initial Setup, Property Transfer

-- Transaction 9a: Create new user with initial watchlist setup
BEGIN TRANSACTION;

-- Insert new user
INSERT INTO users (username, email, full_name, account_status)
VALUES ('new_investor', 'investor@example.com', 'Investment Group LLC', 'active');

-- Get the new user_id
-- In application code, you would capture the last_insert_rowid()

-- Add favorite properties to watchlist
INSERT INTO watchlist (user_id, property_id, notes, priority)
SELECT 
    (SELECT user_id FROM users WHERE username = 'new_investor'),
    property_id,
    'Initial watchlist property',
    3
FROM properties
WHERE neighborhood_id = 1
LIMIT 5;

-- Create default saved search
INSERT INTO saved_searches (user_id, search_name, search_criteria)
VALUES (
    (SELECT user_id FROM users WHERE username = 'new_investor'),
    'My Default Search',
    '{"neighborhood": "Downtown", "max_value": 2000000}'
);

COMMIT;

-- Transaction 9b: Transfer property ownership / Update property with history
BEGIN TRANSACTION;

-- Save current values to history before update
INSERT INTO tax_history (
    property_id,
    assessment_year,
    land_value,
    improvement_value,
    tax_levy
)
SELECT 
    property_id,
    current_year,
    current_land_value,
    current_improvement_value,
    tax_levy
FROM properties
WHERE pid = '123-456-789';

-- Update property with new assessment
UPDATE properties
SET 
    current_land_value = current_land_value * 1.05,
    current_improvement_value = current_improvement_value * 1.03,
    current_year = 2025,
    updated_at = CURRENT_TIMESTAMP
WHERE pid = '123-456-789';

COMMIT;

-- Transaction 9c: Rollback example - Failed operation
BEGIN TRANSACTION;

-- Try to insert invalid data
INSERT INTO properties (
    pid, 
    civic_address, 
    neighborhood_id,
    current_land_value,
    current_improvement_value,
    current_year
) VALUES (
    'INVALID-PID',
    '',  -- Empty address (violates CHECK constraint)
    999,  -- Non-existent neighborhood
    -1000,  -- Negative value (violates CHECK constraint)
    500000,
    2024
);

-- This will fail due to constraints, so transaction rolls back
ROLLBACK;

-- ============================================================================
-- 10. COMPLEX QUERIES (Bonus - Showcasing Advanced SQL)
-- ============================================================================

-- Query 10a: Property value appreciation analysis
WITH value_changes AS (
    SELECT 
        p.property_id,
        p.civic_address,
        p.current_total_value as current_value,
        th.total_value as previous_value,
        th.assessment_year,
        ROUND(((p.current_total_value - th.total_value) / th.total_value * 100), 2) as change_percent
    FROM properties p
    JOIN tax_history th ON p.property_id = th.property_id
    WHERE th.assessment_year = p.current_year - 1
)
SELECT 
    civic_address,
    current_value,
    previous_value,
    change_percent,
    CASE 
        WHEN change_percent > 10 THEN 'High Growth'
        WHEN change_percent > 5 THEN 'Moderate Growth'
        WHEN change_percent > 0 THEN 'Low Growth'
        ELSE 'Decline'
    END as growth_category
FROM value_changes
ORDER BY change_percent DESC
LIMIT 20;

-- Query 10b: Neighborhood comparison with rankings
SELECT 
    neighborhood_name,
    property_count,
    avg_value,
    RANK() OVER (ORDER BY avg_value DESC) as value_rank,
    RANK() OVER (ORDER BY property_count DESC) as count_rank
FROM (
    SELECT 
        n.neighborhood_name,
        COUNT(p.property_id) as property_count,
        ROUND(AVG(p.current_total_value), 2) as avg_value
    FROM neighborhoods n
    JOIN properties p ON n.neighborhood_id = p.neighborhood_id
    GROUP BY n.neighborhood_id, n.neighborhood_name
);

-- Query 10c: User engagement metrics
SELECT 
    u.username,
    u.full_name,
    COUNT(DISTINCT w.property_id) as watchlist_size,
    COUNT(DISTINCT s.search_id) as saved_searches,
    MAX(w.added_at) as last_watchlist_update,
    JULIANDAY('now') - JULIANDAY(u.last_login) as days_since_login,
    CASE 
        WHEN JULIANDAY('now') - JULIANDAY(u.last_login) < 7 THEN 'Active'
        WHEN JULIANDAY('now') - JULIANDAY(u.last_login) < 30 THEN 'Moderate'
        ELSE 'Inactive'
    END as engagement_level
FROM users u
LEFT JOIN watchlist w ON u.user_id = w.user_id
LEFT JOIN saved_searches s ON u.user_id = s.user_id
GROUP BY u.user_id, u.username, u.full_name, u.last_login
ORDER BY watchlist_size DESC;

-- ============================================================================
-- END OF QUERIES
-- ============================================================================
-- These queries demonstrate all required SQL operations for WMDD 4921:
-- ✓ Filtering with WHERE and HAVING
-- ✓ ORDER BY and LIMIT
-- ✓ Aggregation (COUNT, AVG, SUM, MIN, MAX) and GROUP BY
-- ✓ INSERT operations
-- ✓ JOIN operations (INNER, LEFT, multiple joins, self-join)
-- ✓ UPDATE operations
-- ✓ DELETE operations
-- ✓ TRANSACTIONS with BEGIN, COMMIT, ROLLBACK
--
-- Each query includes comments explaining:
-- - Use case in the application
-- - Which feature would use this query
-- - Purpose and expected results
-- ============================================================================
