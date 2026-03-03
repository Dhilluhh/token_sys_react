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

    // Extract base parts
    const baseParts = [];

    // First char of purpose
    if (safePurpose.length > 0) {
        baseParts.push(safePurpose[0]);
    }

    // Last char of user_id
    if (safeUserId.length > 0) {
        baseParts.push(safeUserId[safeUserId.length - 1]);
    }

    // Last char of validity_days
    if (safeValidityDays.length > 0) {
        baseParts.push(safeValidityDays[safeValidityDays.length - 1]);
    }

    // First char of role
    if (safeRole.length > 0) {
        baseParts.push(safeRole[0]);
    }

    // Filter to only characters in charset
    let filtered = '';
    for (const char of baseParts) {
        if (charsetStr.includes(char)) {
            filtered += char;
        }
    }

    // Pad with deterministic characters if needed
    if (filtered.length < length) {
        const seed = simpleHash(safeUserId + safePurpose + safeRole);
        while (filtered.length < length) {
            const index = (seed + filtered.length) % charsetStr.length;
            filtered += charsetStr[index];
        }
    }

    return filtered.substring(0, length);
}

const description = "Picks a few predefined characters from your information";

module.exports = { generate, description };
