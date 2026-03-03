const { pool } = require('../database/db');
const bcrypt = require('bcrypt');

/**
 * Admin Model
 * Handles all database operations for Admins table
 */

// Find admin by username
async function findAdminByUsername(username) {
    const [rows] = await pool.query(
        'SELECT * FROM Admins WHERE Username = ? AND status = ?',
        [username, 'active']
    );
    return rows[0];
}

// Find admin by email
async function findAdminByEmail(email) {
    const [rows] = await pool.query(
        'SELECT * FROM Admins WHERE Email = ? AND status = ?',
        [email, 'active']
    );
    return rows[0];
}

// Find admin by ID
async function findAdminById(adminId) {
    const [rows] = await pool.query(
        'SELECT Admin_ID, Username, Email, created_at, created_by, last_login, status FROM Admins WHERE Admin_ID = ?',
        [adminId]
    );
    return rows[0];
}

// Verify admin password
async function verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

// Update last login timestamp
async function updateLastLogin(adminId) {
    const [result] = await pool.query(
        'UPDATE Admins SET last_login = CURRENT_TIMESTAMP WHERE Admin_ID = ?',
        [adminId]
    );
    return result.affectedRows > 0;
}

// Create a new admin (only by existing admins)
async function createAdmin(adminData, createdByAdminId) {
    const { Username, Email, Password } = adminData;

    try {
        // Hash the password
        const Password_hash = await bcrypt.hash(Password, 10);

        const [result] = await pool.query(
            `INSERT INTO Admins 
            (Username, Email, Password_hash, created_by) 
            VALUES (?, ?, ?, ?)`,
            [Username, Email, Password_hash, createdByAdminId]
        );

        return {
            Admin_ID: result.insertId,
            Username,
            Email,
            status: 'active'
        };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('Username')) {
                throw new Error('Username already exists');
            }
            if (error.message.includes('Email')) {
                throw new Error('Email already exists');
            }
        }
        throw error;
    }
}

// Get all admins
async function getAllAdmins() {
    const [rows] = await pool.query(
        'SELECT Admin_ID, Username, Email, created_at, created_by, last_login, status FROM Admins ORDER BY created_at DESC'
    );
    return rows;
}

// Update admin status
async function updateAdminStatus(adminId, status) {
    const [result] = await pool.query(
        'UPDATE Admins SET status = ? WHERE Admin_ID = ?',
        [status, adminId]
    );
    return result.affectedRows > 0;
}

// Check if admin exists (for initial setup)
async function adminExists() {
    const [rows] = await pool.query(
        'SELECT COUNT(*) as count FROM Admins WHERE status = ?',
        ['active']
    );
    return rows[0].count > 0;
}

module.exports = {
    findAdminByUsername,
    findAdminByEmail,
    findAdminById,
    verifyPassword,
    updateLastLogin,
    createAdmin,
    getAllAdmins,
    updateAdminStatus,
    adminExists
};
