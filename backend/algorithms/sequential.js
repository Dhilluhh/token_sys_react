const { pool } = require('../database/db');

/**
 * Sequential Token Generator
 * Generates tokens in the format: [consumer_id][purpose_code][sequence_number]
 * Example: 123COMP0001, 123COMP0002, etc.
 * 
 * This is ideal for sequential purposes like:
 * - Complaint tracking
 * - Order numbers
 * - Ticket systems
 * - Invoice numbers
 */

/**
 * Get purpose code from purpose string
 * @param {string} purpose - Purpose of the token
 * @returns {string} 4-character purpose code
 */
function getPurposeCode(purpose) {
    const purposeMap = {
        'AUTHENTICATION': 'AUTH',
        'AUTHORIZATION': 'AUTZ',
        'SESSION': 'SESS',
        'PAYMENT': 'PAYM',
        'VERIFICATION': 'VRFY',
        'RESET': 'RSET',
        'COMPLAINT': 'COMP',
        'ORDER': 'ORDR',
        'TICKET': 'TCKT',
        'INVOICE': 'INVC',
        'REQUEST': 'RQST',
        'APPROVAL': 'APPR'
    };

    const upperPurpose = (purpose || 'REQUEST').toUpperCase();

    // Return mapped code or first 4 characters of purpose
    return purposeMap[upperPurpose] || upperPurpose.substring(0, 4).toUpperCase();
}

/**
 * Get next sequence number for a consumer and purpose
 * @param {number} consumerId - Consumer ID
 * @param {string} purpose - Purpose of the token
 * @returns {Promise<number>} Next sequence number
 */
async function getNextSequenceNumber(consumerId, purpose) {
    try {
        // Count existing tokens for this consumer and purpose using the sequential algorithm
        const [rows] = await pool.query(
            `SELECT COUNT(*) as count 
             FROM Tokens 
             WHERE Consumer_ID = ? 
             AND purpose = ? 
             AND algorithm = 'sequential'`,
            [consumerId, purpose]
        );

        // Next sequence number is count + 1
        return (rows[0].count || 0) + 1;
    } catch (error) {
        console.error('Error getting sequence number:', error);
        // If database query fails, use timestamp-based fallback
        return Date.now() % 10000;
    }
}

/**
 * Generate sequential token
 * @param {Object} context - Token generation context
 * @returns {Promise<string>} Generated sequential token
 */
async function generate(context) {
    const {
        consumer_id,
        purpose = 'REQUEST'
    } = context;

    // Validate required fields
    if (consumer_id === undefined || consumer_id === null) {
        throw new Error('consumer_id is required for sequential token generation');
    }

    // Ensure purpose is a string (not undefined)
    const safePurpose = String(purpose || 'REQUEST');

    // Get purpose code
    const purposeCode = getPurposeCode(safePurpose);

    // Get next sequence number
    const sequenceNumber = await getNextSequenceNumber(consumer_id, safePurpose);

    // Get complexity to determine sequence padding
    const complexity = context.complexity || 'M';
    let padding = 6; // Medium (default)
    if (complexity === 'S') padding = 1;
    else if (complexity === 'C') padding = 8;

    // Format sequence number with leading zeros based on complexity
    const formattedSequence = padding === 1 ? String(sequenceNumber) : String(sequenceNumber).padStart(padding, '0');

    // Generate token: [consumer_id][purpose_code][sequence]
    // Example: 123COMP000001, 123COMP000002, etc.
    const token = `${consumer_id}${purposeCode}${formattedSequence}`;

    return token;
}

const description = "Generates sequential tokens in format [consumer_id][purpose][sequence]. Perfect for complaints, orders, tickets, and invoices.";

module.exports = { generate, description };
