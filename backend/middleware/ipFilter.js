const fs = require('fs');
const path = require('path');

// Configuration file path
const CONFIG_FILE = path.join(__dirname, '../config/ipConfig.json');

// Default configuration
const DEFAULT_CONFIG = {
    mode: 'BLACKLIST', // Options: 'BLACKLIST' (default allow), 'WHITELIST' (default deny)
    blacklist: [],     // IPs to block in BLACKLIST mode
    whitelist: []      // IPs to allow in WHITELIST mode
};

// Ensure config file exists
if (!fs.existsSync(path.dirname(CONFIG_FILE))) {
    fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
}

if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
}

// Helper to get client IP
const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',').shift() ||
        req.socket.remoteAddress?.replace('::ffff:', '') ||
        req.ip;
};

// Middleware function
const ipFilter = (req, res, next) => {
    try {
        // Reload config on each request to allow dynamic updates without restart
        // For high traffic, this might be cached with a watcher, but fine for now
        const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
        const config = JSON.parse(configData);

        const clientIp = getClientIp(req);

        // Skip check for localhost/loopback if needed, but usually we want to control everything
        // Note: ::1 is IPv6 loopback, 127.0.0.1 is IPv4

        if (config.mode === 'WHITELIST') {
            // Default Deny: Allow only if in whitelist
            if (config.whitelist.includes(clientIp)) {
                return next();
            }
            console.warn(`[IP Filter] Blocked request from ${clientIp} (Not in whitelist)`);
            return res.status(403).json({
                error: 'Access Denied',
                message: 'Your IP address is not authorized to access this resource.'
            });
        } else {
            // Default Allow: Block only if in blacklist
            if (config.blacklist.includes(clientIp)) {
                console.warn(`[IP Filter] Blocked request from ${clientIp} (In blacklist)`);
                return res.status(403).json({
                    error: 'Access Denied',
                    message: 'Your IP address has been blocked.'
                });
            }
            return next();
        }
    } catch (error) {
        console.error('IP Filter Error:', error);
        // Fail open or closed? stick to fail open for now to avoid accidental lockout on config error, 
        // or fail closed for security. Let's fail open but log error.
        next();
    }
};

module.exports = ipFilter;
