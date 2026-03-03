const crypto = require('crypto');
const { getCharset, getLengthFromComplexity, simpleHash, getTimeSession, getPurposeCode } = require('../utils/charsets');

function generate(context) {
    const {
        user_id = '',
        issue_date = '',
        purpose = '',
        charset = 'ALPHANUM',
        complexity = 'M'
    } = context;

    // Ensure all values are strings (not undefined)
    const safeUserId = String(user_id || '');
    const safeIssueDate = String(issue_date || '');
    const safePurpose = String(purpose || '');

    // Get charset and length
    const charsetStr = getCharset(charset);
    const length = getLengthFromComplexity(complexity);

    // Compute deterministic parts
    const session = getTimeSession(safeIssueDate);
    const usageCode = getPurposeCode(safePurpose);

    const p1 = simpleHash(safeUserId);
    const p2 = simpleHash(safeIssueDate) + (session * 100) + usageCode;

    // Generate cryptographic random integers
    const r1 = crypto.randomBytes(4).readUInt32BE(0);
    const r2 = crypto.randomBytes(4).readUInt32BE(0);

    const m = charsetStr.length;

    // Start with deterministic + random parts
    let token = charsetStr[p1 % m] +
        charsetStr[p2 % m] +
        charsetStr[r1 % m] +
        charsetStr[r2 % m];

    // Pad with random characters if needed
    while (token.length < length) {
        const randomByte = crypto.randomBytes(1)[0];
        token += charsetStr[randomByte % charsetStr.length];
    }

    return token.substring(0, length);
}

const description = "Generates unique random tokens every time";

module.exports = { generate, description };
