const express = require('express');
const router = express.Router();
const Token = require('../models/Token');

/**
 * Token Management Routes
 */

// GET /api/tokens/consumer/:consumerId - Get all tokens for a consumer
router.get('/consumer/:consumerId', async (req, res) => {
    try {
        const consumerId = req.params.consumerId;
        const filters = {
            status: req.query.status,
            user_id: req.query.user_id,
            algorithm: req.query.algorithm,
            limit: req.query.limit
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key =>
            filters[key] === undefined && delete filters[key]
        );

        // Update expired tokens before fetching
        await Token.updateExpiredTokens();

        const tokens = await Token.getTokensByConsumer(consumerId, filters);

        res.json({
            count: tokens.length,
            tokens
        });

    } catch (error) {
        console.error('Fetch tokens error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch tokens',
            message: error.message
        });
    }
});

// GET /api/tokens/user/:consumerId/:userId - Get tokens for a specific user
router.get('/user/:consumerId/:userId', async (req, res) => {
    try {
        const { consumerId, userId } = req.params;

        const tokens = await Token.getTokensByUser(consumerId, userId);

        res.json({
            count: tokens.length,
            tokens
        });

    } catch (error) {
        console.error('Fetch user tokens error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch user tokens',
            message: error.message
        });
    }
});

// POST /api/tokens/validate - Validate a token
router.post('/validate', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                error: 'Token is required'
            });
        }

        const tokenData = await Token.validateToken(token);

        if (!tokenData) {
            return res.status(404).json({
                valid: false,
                error: 'Token not found'
            });
        }

        const isValid = tokenData.status === 'active';

        res.json({
            valid: isValid,
            token: tokenData,
            reason: !isValid ? tokenData.status : null
        });

    } catch (error) {
        console.error('Token validation error:', error.message);
        res.status(500).json({
            error: 'Validation failed',
            message: error.message
        });
    }
});

// POST /api/tokens/revoke - Revoke a token
router.post('/revoke', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                error: 'Token is required'
            });
        }

        const revoked = await Token.revokeToken(token);

        if (!revoked) {
            return res.status(404).json({
                error: 'Token not found'
            });
        }

        res.json({
            message: 'Token revoked successfully',
            token
        });

    } catch (error) {
        console.error('Token revocation error:', error.message);
        res.status(500).json({
            error: 'Revocation failed',
            message: error.message
        });
    }
});

// GET /api/tokens/stats/:consumerId - Get token statistics
router.get('/stats/:consumerId', async (req, res) => {
    try {
        const consumerId = req.params.consumerId;

        const stats = await Token.getTokenStatsByAlgorithm(consumerId);

        res.json({
            stats
        });

    } catch (error) {
        console.error('Stats fetch error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch statistics',
            message: error.message
        });
    }
});

// DELETE /api/tokens/cleanup - Cleanup old expired tokens
router.delete('/cleanup', async (req, res) => {
    try {
        const daysOld = parseInt(req.query.days) || 30;

        const deleted = await Token.deleteExpiredTokens(daysOld);

        res.json({
            message: 'Cleanup completed',
            deleted_count: deleted
        });

    } catch (error) {
        console.error('Cleanup error:', error.message);
        res.status(500).json({
            error: 'Cleanup failed',
            message: error.message
        });
    }
});

module.exports = router;
