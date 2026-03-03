const { pool } = require('../database/db');

/**
 * Token Model
 * Handles all database operations for Tokens table
 */

// Create a new token
async function createToken(tokenData) {
    const {
        Token,
        Consumer_ID,
        User_id,
        purpose,
        Validity,
        expires_at,
        role,
        complexity,
        algorithm
    } = tokenData;

    try {
        const [result] = await pool.query(
            `INSERT INTO Tokens 
            (Token, Consumer_ID, User_id, purpose, Validity, expires_at, role, complexity, algorithm) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [Token, Consumer_ID, User_id, purpose, Validity, expires_at, role, complexity, algorithm]
        );

        return {
            Token_ID: result.insertId,
            ...tokenData,
            status: 'active'
        };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Token already exists (duplicate)');
        }
        throw error;
    }
}

// Find token by token value
async function findTokenByValue(tokenValue) {
    const [rows] = await pool.query(
        'SELECT * FROM Tokens WHERE Token = ?',
        [tokenValue]
    );
    return rows[0];
}

// Find token by ID
async function findTokenById(tokenId) {
    const [rows] = await pool.query(
        'SELECT * FROM Tokens WHERE Token_ID = ?',
        [tokenId]
    );
    return rows[0];
}

// Get all tokens for a consumer
async function getTokensByConsumer(consumerId, filters = {}) {
    let query = 'SELECT * FROM Tokens WHERE Consumer_ID = ?';
    const params = [consumerId];

    // Add optional filters
    if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
    }

    if (filters.user_id) {
        query += ' AND User_id = ?';
        params.push(filters.user_id);
    }

    if (filters.algorithm) {
        query += ' AND algorithm = ?';
        params.push(filters.algorithm);
    }

    query += ' ORDER BY Issued_at DESC';

    if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
    }

    const [rows] = await pool.query(query, params);
    return rows;
}

// Get all tokens for a specific user
async function getTokensByUser(consumerId, userId) {
    const [rows] = await pool.query(
        'SELECT * FROM Tokens WHERE Consumer_ID = ? AND User_id = ? ORDER BY Issued_at DESC',
        [consumerId, userId]
    );
    return rows;
}

// Update token status
async function updateTokenStatus(tokenId, status) {
    const [result] = await pool.query(
        'UPDATE Tokens SET status = ? WHERE Token_ID = ?',
        [status, tokenId]
    );
    return result.affectedRows > 0;
}

// Revoke token
async function revokeToken(tokenValue) {
    const [result] = await pool.query(
        'UPDATE Tokens SET status = ? WHERE Token = ?',
        ['revoked', tokenValue]
    );
    return result.affectedRows > 0;
}

// Check and update expired tokens
async function updateExpiredTokens() {
    const [result] = await pool.query(
        `UPDATE Tokens 
        SET status = 'expired' 
        WHERE status = 'active' 
        AND (
            expires_at < NOW() 
            OR (expires_at IS NULL AND TIMESTAMPADD(MINUTE, Validity, Issued_at) < NOW())
        )`
    );
    return result.affectedRows;
}

// Get token statistics by algorithm
async function getTokenStatsByAlgorithm(consumerId) {
    const [rows] = await pool.query(
        `SELECT 
            algorithm,
            COUNT(*) as count,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
        FROM Tokens 
        WHERE Consumer_ID = ?
        GROUP BY algorithm`,
        [consumerId]
    );
    return rows;
}

// Delete old expired tokens (cleanup)
async function deleteExpiredTokens(daysOld = 30) {
    const [result] = await pool.query(
        `DELETE FROM Tokens 
        WHERE status = 'expired' 
        AND Issued_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
        [daysOld]
    );
    return result.affectedRows;
}

// Validate token (check if active and not expired)
async function validateToken(tokenValue) {
    const [rows] = await pool.query(
        `SELECT *, 
        COALESCE(expires_at, TIMESTAMPADD(MINUTE, Validity, Issued_at)) as expiry_time,
        CASE 
            WHEN COALESCE(expires_at, TIMESTAMPADD(MINUTE, Validity, Issued_at)) < NOW() THEN 'expired'
            ELSE status
        END as current_status
        FROM Tokens 
        WHERE Token = ?`,
        [tokenValue]
    );

    const token = rows[0];
    if (!token) return null;

    // Auto-update if expired
    if (token.current_status === 'expired' && token.status === 'active') {
        await updateTokenStatus(token.Token_ID, 'expired');
        token.status = 'expired';
    }

    return token;
}

module.exports = {
    createToken,
    findTokenByValue,
    findTokenById,
    getTokensByConsumer,
    getTokensByUser,
    updateTokenStatus,
    revokeToken,
    updateExpiredTokens,
    getTokenStatsByAlgorithm,
    deleteExpiredTokens,
    validateToken
};
