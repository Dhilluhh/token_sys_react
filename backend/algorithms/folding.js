const crypto = require('crypto');
const { getCharset, getLengthFromComplexity, simpleHash } = require('../utils/charsets');

function generate(context) {
    const {
        purpose = '',
        user_id = '',
        validity_days = '',
        role = '',
        charset = 'ALPHANUM',
        complexity = 'M'
    } = context;

    // Ensure all values are strings (not undefined)
    const safePurpose = String(purpose || '');
    const safeUserId = String(user_id || '');
    const safeValidityDays = String(validity_days || '');
    const safeRole = String(role || '');

    // Get charset and length
    const charsetStr = getCharset(charset);
    const length = getLengthFromComplexity(complexity);

    // Combine all inputs
    const combined = safePurpose + safeUserId + safeValidityDays + safeRole;

    // Filter to only characters in charset
    let filtered = '';
    for (let i = 0; i < combined.length; i++) {
        if (charsetStr.includes(combined[i])) {
            filtered += combined[i];
        }
    }

    // If no valid characters, use deterministic padding
    if (filtered.length === 0) {
        const seed = simpleHash(safeUserId + safePurpose + safeRole);
        let token = '';
        for (let i = 0; i < length; i++) {
            token += charsetStr[(seed + i) % charsetStr.length];
        }
        return token;
    }

    // Calculate step for folding
    const step = Math.max(1, Math.floor(filtered.length / length));

    // Take every step-th character
    let token = '';
    for (let i = 0; i < filtered.length && token.length < length; i += step) {
        token += filtered[i];
    }

    // Pad if needed
    if (token.length < length) {
        const seed = simpleHash(safeUserId + safePurpose + safeRole);
        while (token.length < length) {
            token += charsetStr[(seed + token.length) % charsetStr.length];
        }
    }

    // Truncate to required length
    return token.substring(0, length);
}

const description = "Combines and mixes your information evenly";

module.exports = { generate, description };
