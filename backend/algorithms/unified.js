const crypto = require('crypto');
const { getCharset, getLengthFromComplexity } = require('../utils/charsets');

function generate(context) {
    const {
        user_id = '',
        purpose = 'AUTHENTICATION',
        role = 'USER',
        charset = 'ALPHANUM',
        complexity = 'M'
    } = context;

    // Ensure all values are strings (not undefined)
    const safeUserId = String(user_id || '');
    const safePurpose = String(purpose || 'AUTHENTICATION');
    const safeRole = String(role || 'USER');

    // Get charset and length
    const charsetStr = getCharset(charset);
    const length = getLengthFromComplexity(complexity);

    // Phase 1: Hash-based seed
    const pattern = `${safeUserId}|${safePurpose}|${safeRole}`;
    const hashDigest = crypto.createHash('sha256').update(pattern).digest();

    // Phase 2: Fold and transform
    const combined = safeUserId + safePurpose + safeRole;
    const filtered = combined
        .split('')
        .filter(c => charsetStr.includes(c))
        .join('');

    const tokenParts = [];

    // Use half from hash
    const halfLen = Math.floor(length / 2);
    for (let i = 0; i < halfLen; i++) {
        tokenParts.push(charsetStr[hashDigest[i] % charsetStr.length]);
    }

    // Use half from folded pattern
    if (filtered.length > 0) {
        const step = Math.max(1, Math.floor(filtered.length / (length - halfLen)));
        let idx = 0;
        for (let i = 0; i < length - halfLen; i++) {
            tokenParts.push(filtered[idx % filtered.length]);
            idx += step;
        }
    } else {
        // Fallback to secure random using crypto
        for (let i = 0; i < length - halfLen; i++) {
            const randomBytes = crypto.randomBytes(1);
            tokenParts.push(charsetStr[randomBytes[0] % charsetStr.length]);
        }
    }

    return tokenParts.join('');
}

const description = "Balanced approach combining multiple generation methods";

module.exports = { generate, description };
