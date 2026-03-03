const { pool } = require('../database/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/**
 * Consumer Registry Model
 * Handles all database operations for Consumer_Registry table
 */

// Create a new consumer (registration)
async function createConsumer(consumerData) {
    const { Consumer_Name, Contact, Password } = consumerData;

    try {
        // Hash the password
        const Password_hash = await bcrypt.hash(Password, 10);

        // Generate unique API key
        const api_key = uuidv4().replace(/-/g, '');

        const [result] = await pool.query(
            `INSERT INTO Consumer_Registry 
            (Consumer_Name, Contact, Password_hash, api_key) 
            VALUES (?, ?, ?, ?)`,
            [Consumer_Name, Contact, Password_hash, api_key]
        );

        return {
            Consumer_ID: result.insertId,
            Consumer_Name,
            Contact,
            api_key,
            status: 'active'
        };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Email already registered');
        }
        throw error;
    }
}

// Find consumer by email
async function findConsumerByEmail(email) {
    const [rows] = await pool.query(
        'SELECT * FROM Consumer_Registry WHERE Contact = ?',
        [email]
    );
    return rows[0];
}

// Find consumer by ID
async function findConsumerById(consumerId) {
    const [rows] = await pool.query(
        'SELECT Consumer_ID, Consumer_Name, Contact, api_key, status, registered_at FROM Consumer_Registry WHERE Consumer_ID = ?',
        [consumerId]
    );
    return rows[0];
}

// Find consumer by API key
async function findConsumerByApiKey(apiKey) {
    const [rows] = await pool.query(
        'SELECT Consumer_ID, Consumer_Name, Contact, api_key, status FROM Consumer_Registry WHERE api_key = ?',
        [apiKey]
    );
    return rows[0];
}

// Verify consumer password
async function verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

// Update consumer status
async function updateConsumerStatus(consumerId, status) {
    const [result] = await pool.query(
        'UPDATE Consumer_Registry SET status = ? WHERE Consumer_ID = ?',
        [status, consumerId]
    );
    return result.affectedRows > 0;
}

// Get all consumers (admin function)
async function getAllConsumers() {
    const [rows] = await pool.query(
        'SELECT Consumer_ID, Consumer_Name, Contact, status, registered_at FROM Consumer_Registry ORDER BY registered_at DESC'
    );
    return rows;
}

// Get consumer statistics
async function getConsumerStats(consumerId) {
    const [rows] = await pool.query(
        `SELECT 
            COUNT(*) as total_tokens,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_tokens,
            SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired_tokens,
            SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) as revoked_tokens
        FROM Tokens 
        WHERE Consumer_ID = ?`,
        [consumerId]
    );
    return rows[0];
}

module.exports = {
    createConsumer,
    findConsumerByEmail,
    findConsumerById,
    findConsumerByApiKey,
    verifyPassword,
    updateConsumerStatus,
    getAllConsumers,
    getConsumerStats
};
