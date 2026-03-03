const Token = require('../models/Token');

/**
 * Token Expiry Service
 * Handles automatic expiry of tokens based on expires_at timestamp
 */

class TokenExpiryService {
    constructor() {
        this.intervalId = null;
        this.isRunning = false;
        this.checkIntervalMs = 60000; // Check every 60 seconds (1 minute)
    }

    /**
     * Start the automatic expiry checker
     */
    start() {
        if (this.isRunning) {
            console.log('⚠ Token expiry service is already running');
            return;
        }

        console.log('🕒 Starting token expiry service...');
        console.log(`   Checking for expired tokens every ${this.checkIntervalMs / 1000} seconds`);

        // Run immediately on start
        this.checkAndUpdateExpiredTokens();

        // Then run periodically
        this.intervalId = setInterval(() => {
            this.checkAndUpdateExpiredTokens();
        }, this.checkIntervalMs);

        this.isRunning = true;
        console.log('✓ Token expiry service started successfully');
    }

    /**
     * Stop the automatic expiry checker
     */
    stop() {
        if (!this.isRunning) {
            console.log('⚠ Token expiry service is not running');
            return;
        }

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isRunning = false;
        console.log('✓ Token expiry service stopped');
    }

    /**
     * Check and update expired tokens
     */
    async checkAndUpdateExpiredTokens() {
        try {
            const updatedCount = await Token.updateExpiredTokens();

            if (updatedCount > 0) {
                const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
                console.log(`[${timestamp}] ⏰ Updated ${updatedCount} expired token(s)`);
            }

            return updatedCount;
        } catch (error) {
            console.error('Error checking expired tokens:', error.message);
            return 0;
        }
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            checkIntervalMs: this.checkIntervalMs,
            checkIntervalSeconds: this.checkIntervalMs / 1000
        };
    }

    /**
     * Set check interval (in milliseconds)
     */
    setCheckInterval(intervalMs) {
        if (intervalMs < 1000) {
            throw new Error('Interval must be at least 1000ms (1 second)');
        }

        const wasRunning = this.isRunning;

        if (wasRunning) {
            this.stop();
        }

        this.checkIntervalMs = intervalMs;

        if (wasRunning) {
            this.start();
        }

        console.log(`✓ Check interval updated to ${intervalMs / 1000} seconds`);
    }
}

// Create singleton instance
const tokenExpiryService = new TokenExpiryService();

module.exports = tokenExpiryService;
