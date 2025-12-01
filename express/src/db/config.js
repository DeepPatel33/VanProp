const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/data.db');

function createConnection() {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error connecting to database:', err.message);
            throw err;
        }
        console.log('Connected to SQLite database');
    });

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
            console.error('Error enabling foreign keys:', err.message);
        }
    });

    return db;
}


let dbInstance = null;

function getDb() {
    if (!dbInstance) {
        dbInstance = createConnection();
    }
    return dbInstance;
}


function closeDb() {
    if (dbInstance) {
        dbInstance.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed');
                dbInstance = null;
            }
        });
    }
}


function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Query error:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}


function queryOne(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('Query error:', err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}


function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Run error:', err.message);
                reject(err);
            } else {
                resolve({
                    lastID: this.lastID,
                    changes: this.changes
                });
            }
        });
    });
}


async function transaction(callback) {
    const db = getDb();
    
    return new Promise(async (resolve, reject) => {
        db.run('BEGIN TRANSACTION', async (err) => {
            if (err) {
                reject(err);
                return;
            }

            try {
                const result = await callback(db);
                db.run('COMMIT', (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            } catch (error) {
                db.run('ROLLBACK', () => {
                    reject(error);
                });
            }
        });
    });
}

module.exports = {
    getDb,
    closeDb,
    query,
    queryOne,
    run,
    transaction,
    DB_PATH
};
