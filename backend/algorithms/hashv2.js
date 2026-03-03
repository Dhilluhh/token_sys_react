const crypto = require('crypto');
const { getCharset, getLengthFromComplexity } = require('../utils/charsets');

function generate(context) {
    const {
        user_id = '',
        issue_date = '',
        expiry_date = '',
        purpose = 'AUTHENTICATION',
        role = 'USER',
        charset = 'ALPHANUM',
        complexity = 'M'
    } = context;

    // Ensure all values are strings (not undefined)
    const safeUserId = String(user_id || '');
    const safeIssueDate = String(issue_date || '');
    const safeExpiryDate = String(expiry_date || '');
    const safePurpose = String(purpose || 'AUTHENTICATION');
    const safeRole = String(role || 'USER');

    // Get charset and length
    const charsetStr = getCharset(charset);
    const length = getLengthFromComplexity(complexity);

    // Build comprehensive pattern with all context
    const pattern = `${safeUserId}|${safePurpose}|${safeRole}|${safeIssueDate}|${safeExpiryDate}`;

    // Use HMAC with a derived key for stronger security
    const salt = `${safePurpose}${charset}`;

    // First iteration with HMAC-SHA512
    let hashResult = crypto.createHmac('sha512', salt).update(pattern).digest();

    // Additional iterations for complexity == 'C'
    const iterations = complexity === 'C' ? 3 : 1;
    for (let i = 0; i < iterations; i++) {
        const combined = Buffer.concat([hashResult, Buffer.from(pattern)]);
        hashResult = crypto.createHash('sha512').update(combined).digest();
    }

    // Map hash bytes to charset
    let token = '';
    for (let i = 0; i < length; i++) {
        // Use different byte positions for variety
        const byteIdx = (i * 7) % hashResult.length; // Step by 7 to cover more of the hash
        token += charsetStr[hashResult[byteIdx] % charsetStr.length];
    }

    return token;
}

const description = "Enhanced security with multiple layers of protection";

module.exports = { generate, description };
