const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Fetch available algorithms from backend
 * @returns {Promise<Array>} List of algorithms
 */
export async function getAlgorithms() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/algorithms`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.algorithms || [];
    } catch (error) {
        console.error('Error fetching algorithms:', error);
        throw new Error('Failed to fetch algorithms. Please ensure the backend server is running.');
    }
}

/**
 * Register a new consumer/application
 * @param {Object} consumerData - Registration data
 * @returns {Promise<Object>} Registration response with consumer details and API key
 */
export async function registerConsumer(consumerData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Consumer_Name: consumerData.appName,
                Contact: consumerData.email,
                Password: consumerData.password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Error registering consumer:', error);
        throw error;
    }
}

/**
 * Login consumer
 * @param {Object} credentials - Login credentials
 * @returns {Promise<Object>} Login response with consumer details and stats
 */
export async function loginConsumer(credentials) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Contact: credentials.email,
                Password: credentials.password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
}

/**
 * Get consumer profile
 * @param {number} consumerId - Consumer ID
 * @returns {Promise<Object>} Consumer profile and stats
 */
export async function getConsumerProfile(consumerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile/${consumerId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}

/**
 * Generate a token using specified algorithm and context
 * @param {string} algorithm - Algorithm name
 * @param {number} consumerId - Consumer ID
 * @param {Object} context - Token generation context
 * @returns {Promise<Object>} Token response
 */
export async function generateToken(algorithm, consumerId, context) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/generate-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                algorithm,
                consumer_id: consumerId,
                context
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error generating token:', error);
        throw error;
    }
}

/**
 * Get all tokens for a consumer
 * @param {number} consumerId - Consumer ID
 * @param {Object} filters - Optional filters (status, user_id, algorithm, limit)
 * @returns {Promise<Object>} Tokens list
 */
export async function getConsumerTokens(consumerId, filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/api/tokens/consumer/${consumerId}${queryParams ? '?' + queryParams : ''}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching tokens:', error);
        throw error;
    }
}

/**
 * Validate a token
 * @param {string} token - Token to validate
 * @returns {Promise<Object>} Validation result
 */
export async function validateToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tokens/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error validating token:', error);
        throw error;
    }
}

/**
 * Revoke a token
 * @param {string} token - Token to revoke
 * @returns {Promise<Object>} Revocation result
 */
export async function revokeToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tokens/revoke`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error revoking token:', error);
        throw error;
    }
}

/**
 * Get token statistics for a consumer
 * @param {number} consumerId - Consumer ID
 * @returns {Promise<Object>} Token statistics
 */
export async function getTokenStats(consumerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tokens/stats/${consumerId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
    }
}

/**
 * Admin login
 * @param {Object} credentials - Admin credentials (identifier can be username or email)
 * @returns {Promise<Object>} Login response with admin details
 */
export async function loginAdmin(credentials) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier: credentials.identifier,
                Password: credentials.password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Error logging in as admin:', error);
        throw error;
    }
}

/**
 * Create new admin (requires existing admin authentication)
 * @param {Object} adminData - New admin data
 * @param {number} createdByAdminId - ID of the admin creating this account
 * @returns {Promise<Object>} Created admin details
 */
export async function createAdmin(adminData, createdByAdminId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Username: adminData.username,
                Email: adminData.email,
                Password: adminData.password,
                createdByAdminId: createdByAdminId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Error creating admin:', error);
        throw error;
    }
}

/**
 * Get all admins
 * @returns {Promise<Object>} List of all admins
 */
export async function getAllAdmins() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/list`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching admins:', error);
        throw error;
    }
}
