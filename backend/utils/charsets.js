const CHARSETS = {
  NUMBER: "0123456789",
  ALPHA: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  ALPHANUM: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  SPECIAL: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*?"
};

/**
 * Get charset string by key
 * @param {string} key - Charset key (NUMBER, ALPHA, ALPHANUM, SPECIAL)
 * @returns {string} Charset string
 */
function getCharset(key) {
  const charset = CHARSETS[key];
  if (!charset) {
    throw new Error(`Invalid charset key: ${key}. Valid options: ${Object.keys(CHARSETS).join(', ')}`);
  }
  return charset;
}

/**
 * Map complexity to token length
 * @param {string} complexity - S (short), M (medium), C (complex)
 * @returns {number} Token length
 */
function getLengthFromComplexity(complexity) {
  const lengthMap = {
    S: 4,
    M: 6,
    C: 8
  };
  const length = lengthMap[complexity];
  if (!length) {
    throw new Error(`Invalid complexity: ${complexity}. Valid options: S, M, C`);
  }
  return length;
}

/**
 * Simple hash function for deterministic algorithms
 * @param {string} text - Text to hash
 * @returns {number} Hash value
 */
function simpleHash(text) {
  // Convert to string and handle undefined/null
  const str = String(text || '');

  // Return a default hash for empty strings
  if (str.length === 0) {
    return 0;
  }

  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) & 0xFFFFFFFF;
  }
  return h >>> 0;
}

/**
 * Get time session from issue_date
 * @param {string} issueDate - Date string in format "YYYY-MM-DD HH:MM:SS"
 * @returns {number} Session number (1-4)
 */
function getTimeSession(issueDate) {
  try {
    // Parse the date string
    const dateMatch = issueDate.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
    if (!dateMatch) {
      // If parse fails, use current hour
      const now = new Date();
      const hour = now.getHours();
      return mapHourToSession(hour);
    }

    const hour = parseInt(dateMatch[4], 10);
    return mapHourToSession(hour);
  } catch (error) {
    // Fallback to current hour
    const now = new Date();
    const hour = now.getHours();
    return mapHourToSession(hour);
  }
}

/**
 * Map hour to session number
 * @param {number} hour - Hour (0-23)
 * @returns {number} Session (1-4)
 */
function mapHourToSession(hour) {
  if (hour >= 5 && hour <= 11) return 1;
  if (hour >= 12 && hour <= 16) return 2;
  if (hour >= 17 && hour <= 20) return 3;
  return 4;
}

/**
 * Map purpose to usage code
 * @param {string} purpose - Purpose string
 * @returns {number} Usage code
 */
function getPurposeCode(purpose) {
  const purposeMap = {
    'AUTHENTICATION': 1,
    'REGISTRATION': 2,
    'VERIFICATION': 3,
    'PAYMENT GATEWAY': 4,
    'COMPLAINT': 5,
    'OTP': 6
  };
  return purposeMap[purpose] || 0;
}

module.exports = {
  CHARSETS,
  getCharset,
  getLengthFromComplexity,
  simpleHash,
  getTimeSession,
  getPurposeCode
};
