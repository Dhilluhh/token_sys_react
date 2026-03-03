const express = require('express');
const router = express.Router();
const Consumer = require('../models/Consumer');

/**
 * Consumer/Auth Routes
 */

// POST /api/auth/register - Register a new consumer
router.post('/register', async (req, res) => {
    try {
        const { Consumer_Name, Contact, Password } = req.body;

        // Validation
        if (!Consumer_Name || !Contact || !Password) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['Consumer_Name', 'Contact', 'Password']
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Contact)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        // Password strength validation
        if (Password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long'
            });
        }

        const consumer = await Consumer.createConsumer({
            Consumer_Name,
            Contact,
            Password
        });

        res.status(201).json({
            message: 'Registration successful',
            consumer: {
                Consumer_ID: consumer.Consumer_ID,
                Consumer_Name: consumer.Consumer_Name,
                Contact: consumer.Contact,
                api_key: consumer.api_key
            }
        });

    } catch (error) {
        console.error('Registration error:', error.message);

        if (error.message === 'Email already registered') {
            return res.status(409).json({ error: error.message });
        }

        res.status(500).json({
            error: 'Registration failed',
            message: error.message
        });
    }
});

// POST /api/auth/login - Login consumer
router.post('/login', async (req, res) => {
    try {
        const { Contact, Password } = req.body;

        if (!Contact || !Password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        // Find consumer
        const consumer = await Consumer.findConsumerByEmail(Contact);

        if (!consumer) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (consumer.status !== 'active') {
            return res.status(403).json({
                error: 'Account is not active',
                status: consumer.status
            });
        }

        // Verify password
        const isValid = await Consumer.verifyPassword(Password, consumer.Password_hash);

        if (!isValid) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Get consumer stats
        const stats = await Consumer.getConsumerStats(consumer.Consumer_ID);

        res.json({
            message: 'Login successful',
            consumer: {
                Consumer_ID: consumer.Consumer_ID,
                Consumer_Name: consumer.Consumer_Name,
                Contact: consumer.Contact,
                api_key: consumer.api_key,
                status: consumer.status,
                registered_at: consumer.registered_at
            },
            stats
        });

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({
            error: 'Login failed',
            message: error.message
        });
    }
});

// GET /api/auth/profile/:id - Get consumer profile
router.get('/profile/:id', async (req, res) => {
    try {
        const consumerId = req.params.id;

        const consumer = await Consumer.findConsumerById(consumerId);

        if (!consumer) {
            return res.status(404).json({
                error: 'Consumer not found'
            });
        }

        const stats = await Consumer.getConsumerStats(consumerId);

        res.json({
            consumer,
            stats
        });

    } catch (error) {
        console.error('Profile fetch error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch profile',
            message: error.message
        });
    }
});

// GET /api/auth/consumers - Get all consumers (admin)
router.get('/consumers', async (req, res) => {
    try {
        const consumers = await Consumer.getAllConsumers();

        res.json({
            count: consumers.length,
            consumers
        });

    } catch (error) {
        console.error('Fetch consumers error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch consumers',
            message: error.message
        });
    }
});

// PATCH /api/auth/status/:id - Update consumer status
router.patch('/status/:id', async (req, res) => {
    try {
        const consumerId = req.params.id;
        const { status } = req.body;

        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                allowed: ['active', 'inactive', 'suspended']
            });
        }

        const updated = await Consumer.updateConsumerStatus(consumerId, status);

        if (!updated) {
            return res.status(404).json({
                error: 'Consumer not found'
            });
        }

        res.json({
            message: 'Status updated successfully',
            Consumer_ID: consumerId,
            status
        });

    } catch (error) {
        console.error('Status update error:', error.message);
        res.status(500).json({
            error: 'Failed to update status',
            message: error.message
        });
    }
});

// GET /api/auth/admin/stats - Get system-wide statistics (admin)
router.get('/admin/stats', async (req, res) => {
    try {
        const consumers = await Consumer.getAllConsumers();
        const activeConsumers = consumers.filter(c => c.status === 'active').length;

        // Get total tokens across all consumers
        const [tokenStats] = await require('../database/db').pool.query(
            'SELECT COUNT(*) as total_tokens FROM Tokens'
        );

        res.json({
            totalConsumers: consumers.length,
            activeConsumers,
            inactiveConsumers: consumers.filter(c => c.status === 'inactive').length,
            suspendedConsumers: consumers.filter(c => c.status === 'suspended').length,
            totalTokens: tokenStats[0].total_tokens
        });

    } catch (error) {
        console.error('Fetch admin stats error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch admin statistics',
            message: error.message
        });
    }
});

module.exports = router;
