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

    // Get session and usage code
    const session = getTimeSession(safeIssueDate);
    const usageCode = getPurposeCode(safePurpose);

    // Create seeds array
    const seeds = [
        simpleHash(safeUserId),
        simpleHash(safeIssueDate),
        session,
        usageCode
    ];

    // Build base token from seeds
    let baseToken = '';
    for (const seed of seeds) {
        baseToken += charsetStr[seed % charsetStr.length];
    }

    // Repeat or truncate to reach required length
    let token = '';
    while (token.length < length) {
        token += baseToken;
    }

    return token.substring(0, length);
}

const description = "Simple and fast token generation based on time and purpose";

module.exports = { generate, description };
