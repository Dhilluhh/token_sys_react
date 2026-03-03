const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { testConnection, initializeDatabase } = require('./database/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const tokenRoutes = require('./routes/tokens');
const TokenModel = require('./models/Token');
const tokenExpiryService = require('./services/tokenExpiryService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const ipFilter = require('./middleware/ipFilter');

app.use(cors());
app.use(express.json());
app.use(ipFilter);

// Dynamic algorithm discovery
const algorithms = {};
const algorithmsDir = path.join(__dirname, 'algorithms');

try {
    const files = fs.readdirSync(algorithmsDir);

    files.forEach(file => {
        if (file.endsWith('.js')) {
            const algorithmName = file.replace('.js', '');
            const algorithmModule = require(path.join(algorithmsDir, file));

            if (typeof algorithmModule.generate === 'function') {
                algorithms[algorithmName] = algorithmModule;
                console.log(`✓ Loaded algorithm: ${algorithmName}`);
            } else {
                console.warn(`⚠ Skipped ${file}: missing generate() function`);
            }
        }
    });

    console.log(`\nTotal algorithms loaded: ${Object.keys(algorithms).length}\n`);
} catch (error) {
    console.error('Error loading algorithms:', error.message);
}

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tokens', tokenRoutes);

// GET /api/algorithms - List available algorithms
app.get('/api/algorithms', (req, res) => {
    const algorithmList = Object.keys(algorithms).map(name => ({
        name,
        description: algorithms[name].description || 'No description available'
    }));

    res.json({
        count: algorithmList.length,
        algorithms: algorithmList
    });
});

// POST /api/generate-token - Generate a token and save to database
app.post('/api/generate-token', async (req, res) => {
    try {
        const { algorithm, context, consumer_id } = req.body;

        // Validate request
        if (!algorithm) {
            return res.status(400).json({
                error: 'Missing required field: algorithm'
            });
        }

        if (!context || typeof context !== 'object') {
            return res.status(400).json({
                error: 'Missing or invalid context object'
            });
        }

        if (!consumer_id) {
            return res.status(400).json({
                error: 'Missing required field: consumer_id'
            });
        }

        // Check if algorithm exists
        if (!algorithms[algorithm]) {
            return res.status(400).json({
                error: `Unknown algorithm: ${algorithm}`,
                availableAlgorithms: Object.keys(algorithms)
            });
        }

        // Validate required context fields
        if (!context.user_id) {
            return res.status(400).json({
                error: 'Missing required context field: user_id'
            });
        }

        // Set defaults
        const fullContext = {
            charset: 'ALPHANUM',
            complexity: 'M',
            issue_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
            purpose: 'AUTHENTICATION',
            role: 'USER',
            validity_minutes: 30 * 24 * 60, // Default 30 days in minutes
            consumer_id: consumer_id,
            ...context
        };

        // Generate token (support both sync and async algorithms)
        const token = await algorithms[algorithm].generate(fullContext);

        // Calculate expires_at timestamp
        const issuedAt = new Date();
        const expiresAt = new Date(issuedAt.getTime() + fullContext.validity_minutes * 60 * 1000);

        // Check if the algorithm is a proxy (like python_random) that already saved to DB
        let tokenData;
        if (algorithm.startsWith('python_')) {
            // Fetch the record Python just created rather than inserting a duplicate
            tokenData = await TokenModel.findTokenByValue(token);
            if (!tokenData) {
                // Fallback just in case
                tokenData = { Token_ID: 'unknown' };
            }
        } else {
            // Native Node.js algorithm, save token to database
            tokenData = await TokenModel.createToken({
                Token: token,
                Consumer_ID: consumer_id,
                User_id: fullContext.user_id,
                purpose: fullContext.purpose,
                Validity: fullContext.validity_minutes, // Store in minutes
                expires_at: expiresAt,
                role: fullContext.role,
                complexity: fullContext.complexity,
                algorithm: algorithm
            });
        }

        // Log generation (avoid logging sensitive data)
        console.log(`Token generated - Algorithm: ${algorithm}, Consumer: ${consumer_id}, User: ${fullContext.user_id}, Length: ${token.length}, Expires: ${expiresAt.toISOString()}`);

        // --- SOA SMS INTEGRATION TRIGGER (The other team's simulated system) ---
        let sms_status = 'not_requested';
        if (fullContext.phone_number) {
            const { sendTokenToSMS } = require('./services/smsService');
            try {
                await sendTokenToSMS(fullContext.phone_number, token);
                sms_status = 'sent_successfully';
                console.log(`[SOA] Forwarded token to SMS Simulator for requestor (phone: ${fullContext.phone_number})`);
            } catch (err) {
                sms_status = 'failed';
                console.error(`[SOA ERROR] SMS Dispatch failed:`, err.message);
            }
        }
        // ------------------------------------------------------------------------

        // Return response
        res.json({
            token,
            token_id: tokenData.Token_ID,
            algorithm,
            length: token.length,
            charset: fullContext.charset,
            validity_minutes: fullContext.validity_minutes,
            issued_at: tokenData.Issued_at || issuedAt,
            expires_at: expiresAt,
            sms_status // Include in response to prove SOA integration
        });

    } catch (error) {
        console.error('Token generation error:', error.message);

        // Return sanitized error
        res.status(500).json({
            error: 'Token generation failed',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        algorithmsLoaded: Object.keys(algorithms).length,
        database: 'connected'
    });
});

// Initialize database and start server
async function startServer() {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected) {
        console.error('\n⚠ WARNING: Database connection failed. Server will start but database features will not work.\n');
    } else {
        await initializeDatabase();

        // Start token expiry service
        tokenExpiryService.start();
    }

    // Start server
    app.listen(PORT, () => {
        console.log(`• Token Generation Server running on port ${PORT}`);
        console.log(`• Algorithms available: ${Object.keys(algorithms).join(', ')}`);
        console.log(`\nEndpoints:`);
        console.log(`  GET  /api/algorithms`);
        console.log(`  POST /api/generate-token`);
        console.log(`  POST /api/auth/register`);
        console.log(`  POST /api/auth/login`);
        console.log(`  GET  /api/auth/profile/:id`);
        console.log(`  GET  /api/auth/consumers`);
        console.log(`  GET  /api/auth/admin/stats`);
        console.log(`  PATCH /api/auth/status/:id`);
        console.log(`  POST /api/admin/login`);
        console.log(`  POST /api/admin/create`);
        console.log(`  GET  /api/admin/profile/:id`);
        console.log(`  GET  /api/admin/list`);
        console.log(`  PATCH /api/admin/status/:id`);
        console.log(`  GET  /api/tokens/consumer/:consumerId`);
        console.log(`  POST /api/tokens/validate`);
        console.log(`  POST /api/tokens/revoke`);
        console.log(`  GET  /health\n`);
    });
}

startServer();
