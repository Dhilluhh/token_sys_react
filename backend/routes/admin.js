const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

/**
 * Admin Authentication Routes
 * Note: No public signup for admins - only existing admins can create new admins
 */

// POST /api/admin/login - Admin login
router.post('/login', async (req, res) => {
    try {
        const { identifier, Password } = req.body;

        if (!identifier || !Password) {
            return res.status(400).json({
                error: 'Username/Email and password are required'
            });
        }

        // Try to find admin by username or email
        let admin = await Admin.findAdminByUsername(identifier);
        if (!admin) {
            admin = await Admin.findAdminByEmail(identifier);
        }

        if (!admin) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (admin.status !== 'active') {
            return res.status(403).json({
                error: 'Admin account is not active',
                status: admin.status
            });
        }

        // Verify password
        const isValid = await Admin.verifyPassword(Password, admin.Password_hash);

        if (!isValid) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Update last login
        await Admin.updateLastLogin(admin.Admin_ID);

        res.json({
            message: 'Admin login successful',
            admin: {
                Admin_ID: admin.Admin_ID,
                Username: admin.Username,
                Email: admin.Email,
                created_at: admin.created_at,
                last_login: new Date()
            }
        });

    } catch (error) {
        console.error('Admin login error:', error.message);
        res.status(500).json({
            error: 'Login failed',
            message: error.message
        });
    }
});

// POST /api/admin/create - Create new admin (requires admin authentication)
router.post('/create', async (req, res) => {
    try {
        const { Username, Email, Password, createdByAdminId } = req.body;

        // Validation
        if (!Username || !Email || !Password || !createdByAdminId) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['Username', 'Email', 'Password', 'createdByAdminId']
            });
        }

        // Verify that the creator is an active admin
        const creatorAdmin = await Admin.findAdminById(createdByAdminId);
        if (!creatorAdmin) {
            return res.status(403).json({
                error: 'Unauthorized: Only existing admins can create new admins'
            });
        }

        if (creatorAdmin.status !== 'active') {
            return res.status(403).json({
                error: 'Unauthorized: Your admin account is not active'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        // Username validation (alphanumeric and underscore only)
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(Username)) {
            return res.status(400).json({
                error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
            });
        }

        // Password strength validation
        if (Password.length < 8) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters long'
            });
        }

        const newAdmin = await Admin.createAdmin(
            { Username, Email, Password },
            createdByAdminId
        );

        res.status(201).json({
            message: 'Admin created successfully',
            admin: {
                Admin_ID: newAdmin.Admin_ID,
                Username: newAdmin.Username,
                Email: newAdmin.Email,
                created_by: createdByAdminId
            }
        });

    } catch (error) {
        console.error('Admin creation error:', error.message);

        if (error.message === 'Username already exists' || error.message === 'Email already exists') {
            return res.status(409).json({ error: error.message });
        }

        res.status(500).json({
            error: 'Admin creation failed',
            message: error.message
        });
    }
});

// GET /api/admin/profile/:id - Get admin profile
router.get('/profile/:id', async (req, res) => {
    try {
        const adminId = req.params.id;

        const admin = await Admin.findAdminById(adminId);

        if (!admin) {
            return res.status(404).json({
                error: 'Admin not found'
            });
        }

        res.json({
            admin
        });

    } catch (error) {
        console.error('Admin profile fetch error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch admin profile',
            message: error.message
        });
    }
});

// GET /api/admin/list - Get all admins (admin only)
router.get('/list', async (req, res) => {
    try {
        const admins = await Admin.getAllAdmins();

        res.json({
            count: admins.length,
            admins
        });

    } catch (error) {
        console.error('Fetch admins error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch admins',
            message: error.message
        });
    }
});

// PATCH /api/admin/status/:id - Update admin status
router.patch('/status/:id', async (req, res) => {
    try {
        const adminId = req.params.id;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                allowed: ['active', 'inactive']
            });
        }

        const updated = await Admin.updateAdminStatus(adminId, status);

        if (!updated) {
            return res.status(404).json({
                error: 'Admin not found'
            });
        }

        res.json({
            message: 'Admin status updated successfully',
            Admin_ID: adminId,
            status
        });

    } catch (error) {
        console.error('Admin status update error:', error.message);
        res.status(500).json({
            error: 'Failed to update admin status',
            message: error.message
        });
    }
});

module.exports = router;
