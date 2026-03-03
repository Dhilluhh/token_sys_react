const http = require('http');

/**
 * Proxy algorithm that requests a token from the existing Python Token Generation Service
 */
function generate(context) {
    return new Promise((resolve, reject) => {
        // Prepare payload for the Python system
        const payload = JSON.stringify({
            api_key: process.env.PYTHON_API_KEY || '7933f851954247a5904afab805ca76fe', // client1's api key
            algorithm: 'random',
            user_id: context.user_id,
            purpose: context.purpose,
            charset: context.charset || 'NUMBER',
            complexity: context.complexity || 'M',
            jwt_type: 'none', // just want the raw token
        });

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payload.length
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.success && response.token) {
                        resolve(response.token);
                    } else {
                        reject(new Error(response.error || 'Python token generation failed'));
                    }
                } catch (e) {
                    reject(new Error('Failed to parse Python service response: ' + data));
                }
            });
        });

        req.on('error', (e) => {
            reject(new Error('Could not connect to Python Token Service at port 5000: ' + e.message));
        });

        req.write(payload);
        req.end();
    });
}

const description = "Uses the existing Python Token System to generate a random OTP of length 6";

module.exports = { generate, description };
