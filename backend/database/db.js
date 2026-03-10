const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection pool configuration
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'token_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✓ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        return false;
    }
}

// Initialize database (create tables if they don't exist)
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();

        // Check if tables exist
        const [tables] = await connection.query(
            "SHOW TABLES LIKE 'Consumer_Registry'"
        );

        if (tables.length === 0) {
            console.log('⚠ Tables not found. Please run schema.sql first.');
            console.log('Run: mysql -u root -p < backend/database/schema.sql');
        } else {
            console.log('✓ Database tables verified');
        }

        connection.release();
    } catch (error) {
        console.error('✗ Database initialization error:', error.message);
    }
}

module.exports = {
    pool,
    testConnection,
    initializeDatabase
};
