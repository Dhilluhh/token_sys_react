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

    // Create parts array
    const parts = [safePurpose, safeUserId, safeValidityDays, safeRole];

    // Reverse alternate parts
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            parts[i] = parts[i].split('').reverse().join('');
        }
    }

    // Interleave characters from all parts
    let interleaved = '';
    let maxLen = Math.max(...parts.map(p => p.length));

    for (let charIndex = 0; charIndex < maxLen; charIndex++) {
        for (let partIndex = 0; partIndex < parts.length; partIndex++) {
            if (charIndex < parts[partIndex].length) {
                interleaved += parts[partIndex][charIndex];
            }
        }
    }

    // Filter to only characters in charset
    let filtered = '';
    for (let i = 0; i < interleaved.length; i++) {
        if (charsetStr.includes(interleaved[i])) {
            filtered += interleaved[i];
        }
    }

    // If empty or too short, pad with deterministic characters
    if (filtered.length < length) {
        const seed = simpleHash(safeUserId + safePurpose + safeRole);
        while (filtered.length < length) {
            const index = (seed + filtered.length) % charsetStr.length;
            filtered += charsetStr[index];
        }
    }

    // Return first 'length' characters
    return filtered.substring(0, length);
}

const description = "Reverses and weaves your information together";

module.exports = { generate, description };
