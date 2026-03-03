const crypto = require('crypto');
const { getCharset, getLengthFromComplexity, getTimeSession } = require('../utils/charsets');

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

    // Get time session
    const session = getTimeSession(safeIssueDate);

    // Build pattern string
    const pattern = `${safeUserId}|${safeIssueDate}|SESSION=${session}|${safePurpose}|${charset}`;

    // Compute SHA-256 hash
    const hash = crypto.createHash('sha256').update(pattern).digest();

    // Map hash bytes to charset characters
    let token = '';
    for (let i = 0; i < length; i++) {
        const byteValue = hash[i];
        token += charsetStr[byteValue % charsetStr.length];
    }

    return token;
}

const description = "Creates the same token every time for the same inputs";

module.exports = { generate, description };
