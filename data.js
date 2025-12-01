const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Configuration
const DB_PATH = path.join(__dirname, 'express/src/data/data.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const VANCOUVER_API_URL = 'https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/property-tax-report/records';
const BATCH_SIZE = 100;
const MAX_RECORDS = 500; // Reduced for faster import

async function fetchVancouverData(offset = 0, limit = BATCH_SIZE) {
    console.log(`\nFetching records ${offset} to ${offset + limit}...`);
    
    const url = `${VANCOUVER_API_URL}?limit=${limit}&offset=${offset}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // API v2.1 returns data in 'results' array
        if (!data.results || data.results.length === 0) {
            console.log('✓ No more records to fetch');
            return { results: [], total_count: 0 };
        }
        
        console.log(`✓ Fetched ${data.results.length} records`);
        return data;
    } catch (error) {
        console.error('✗ Error fetching data:', error.message);
        throw error;
    }
}


function extractNeighborhoods(records) {
    const neighborhoods = new Set();
    
    records.forEach(record => {
        const neighborhood = record.neighbourhood_code || record.neighborhood_code || 'Unknown';
        if (neighborhood && neighborhood.trim() && neighborhood !== 'Unknown') {
            neighborhoods.add(neighborhood.trim());
        }
    });
    
    return Array.from(neighborhoods);
}

function getNeighborhoodId(db, neighborhoodName) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT neighborhood_id FROM neighborhoods WHERE neighborhood_name = ?',
            [neighborhoodName],
            (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.neighborhood_id : 1); // Default to 1 if not found
            }
        );
    });
}

async function transformRecord(db, record) {
    const neighborhood = record.neighbourhood_code || 'Unknown';
    const neighborhoodId = await getNeighborhoodId(db, neighborhood);
    
    return {
        pid: record.pid || `PID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        civic_address: record.civic_address || record.from_civic_number + ' ' + record.street_name || 'Unknown Address',
        legal_type: record.legal_type || null,
        neighborhood_id: neighborhoodId,
        postal_code: record.postal_code || null,
        coordinates_lat: record.geo_point_2d?.lat || null,
        coordinates_lon: record.geo_point_2d?.lon || null,
        property_type: record.legal_type || 'Unknown',
        zoning_classification: record.zoning_district || null,
        land_area: null,
        current_land_value: parseFloat(record.current_land_value || 0),
        current_improvement_value: parseFloat(record.current_improvement_value || 0),
        tax_levy: parseFloat(record.tax_levy || 0),
        current_year: parseInt(record.tax_assessment_year || record.year || 2024)
    };
}


async function insertNeighborhoods(db, neighborhoods) {
    if (neighborhoods.length === 0) {
        console.log('\nNo neighborhoods found, using defaults...');
        neighborhoods = ['Downtown', 'Kitsilano', 'West End', 'Mount Pleasant', 'Fairview'];
    }
    
    console.log(`\nInserting ${neighborhoods.length} neighborhoods...`);
    
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT OR IGNORE INTO neighborhoods (neighborhood_name, description)
            VALUES (?, ?)
        `);

        let inserted = 0;
        neighborhoods.forEach(name => {
            stmt.run(name, `Properties in ${name}`, (err) => {
                if (!err) inserted++;
            });
        });

        stmt.finalize((err) => {
            if (err) {
                reject(err);
            } else {
                console.log(`✓ Inserted ${inserted} neighborhoods`);
                resolve();
            }
        });
    });
}

async function insertProperties(db, records) {
    if (records.length === 0) {
        console.log('\nNo properties to insert');
        return 0;
    }
    
    console.log(`\nInserting ${records.length} properties...`);
    
    return new Promise(async (resolve, reject) => {
        const stmt = db.prepare(`
            INSERT OR IGNORE INTO properties (
                pid, civic_address, legal_type, neighborhood_id, postal_code,
                coordinates_lat, coordinates_lon, property_type, zoning_classification,
                land_area, current_land_value, current_improvement_value, tax_levy, current_year
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let inserted = 0;
        let errors = 0;

        for (const record of records) {
            try {
                const transformed = await transformRecord(db, record);
                
                stmt.run(
                    transformed.pid,
                    transformed.civic_address,
                    transformed.legal_type,
                    transformed.neighborhood_id,
                    transformed.postal_code,
                    transformed.coordinates_lat,
                    transformed.coordinates_lon,
                    transformed.property_type,
                    transformed.zoning_classification,
                    transformed.land_area,
                    transformed.current_land_value,
                    transformed.current_improvement_value,
                    transformed.tax_levy,
                    transformed.current_year,
                    (err) => {
                        if (err) {
                            errors++;
                            if (errors <= 3) {
                                console.error(`✗ Error inserting property:`, err.message);
                            }
                        } else {
                            inserted++;
                        }
                    }
                );
            } catch (error) {
                errors++;
                if (errors <= 3) {
                    console.error(`✗ Error transforming record:`, error.message);
                }
            }
        }

        stmt.finalize((err) => {
            if (err) {
                reject(err);
            } else {
                console.log(`✓ Inserted ${inserted} properties (${errors} errors)`);
                resolve(inserted);
            }
        });
    });
}

async function insertSampleUsers(db) {
    console.log('\n👥 Inserting sample users...');
    
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT OR IGNORE INTO users (username, email, full_name, account_status)
            VALUES (?, ?, ?, ?)
        `);
        
        stmt.run('john_buyer', 'john@example.com', 'John Smith', 'active');
        stmt.run('sarah_investor', 'sarah@example.com', 'Sarah Johnson', 'active');
        stmt.run('mike_resident', 'mike@example.com', 'Mike Chen', 'active');
        
        stmt.finalize((err) => {
            if (err) reject(err);
            else {
                console.log('✓ Inserted 3 sample users');
                resolve();
            }
        });
    });
}


function displayStats(db) {
    console.log('\nDatabase Statistics:');
    console.log('─'.repeat(50));
    
    return new Promise((resolve) => {
        const queries = [
            { name: 'Neighborhoods', sql: 'SELECT COUNT(*) as count FROM neighborhoods' },
            { name: 'Properties', sql: 'SELECT COUNT(*) as count FROM properties' },
            { name: 'Users', sql: 'SELECT COUNT(*) as count FROM users' }
        ];

        let completed = 0;

        queries.forEach(({ name, sql }) => {
            db.get(sql, (err, row) => {
                if (!err && row) {
                    console.log(`${name.padEnd(25)}: ${row.count}`);
                }
                completed++;
                if (completed === queries.length) {
                    console.log('─'.repeat(50));
                    resolve();
                }
            });
        });
    });
}

/**
 * Main import process
 */
async function main() {
    try {
        console.log('\nDatabase path:', DB_PATH);
        
        // Connect to database
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error connecting to database:', err.message);
                throw err;
            }
        });
        
        console.log('✓ Connected to SQLite database');

        // Fetch data from Vancouver API
        console.log(`\nFetching up to ${MAX_RECORDS} records from Vancouver Open Data...`);
        
        let allRecords = [];
        let offset = 0;
        
        while (offset < MAX_RECORDS) {
            const batch = await fetchVancouverData(offset, BATCH_SIZE);
            
            if (!batch.results || batch.results.length === 0) {
                break;
            }
            
            allRecords.push(...batch.results);
            offset += BATCH_SIZE;
            
            // Small delay to be nice to the API
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`\n✓ Total records fetched: ${allRecords.length}`);

        if (allRecords.length === 0) {
            console.log('\nNo data fetched from API. Using sample data instead...');
            
            // Insert default neighborhoods
            await insertNeighborhoods(db, ['Downtown', 'Kitsilano', 'West End', 'Mount Pleasant', 'Fairview', 'Yaletown', 'Commercial Drive']);
            
            // Insert sample users
            await insertSampleUsers(db);
            
        } else {
            // Extract and insert neighborhoods
            const neighborhoods = extractNeighborhoods(allRecords);
            await insertNeighborhoods(db, neighborhoods);

            // Insert properties
            await insertProperties(db, allRecords);
            await insertSampleUsers(db);
        }

        // Display statistics
        await displayStats(db);

        // Close database
        db.close((err) => {
            if (err) {
                console.error('✗ Error closing database:', err.message);
            } else {
                console.log('\nDatabase closed successfully');
                console.log('\nData import completed!');
                console.log(`Database file: ${DB_PATH}`);
                console.log('\nStart your server with: npm run dev');
            }
        });

    } catch (error) {
        console.error('\nImport failed:', error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

// Run the import
if (require.main === module) {
    main();
}

module.exports = { main, fetchVancouverData };