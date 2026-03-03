import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { getConsumerTokens, validateToken, revokeToken } from '../api';

function ConsumerDashboard() {
    const navigate = useNavigate();
    const [consumerSession, setConsumerSession] = useState(null);
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterAlgorithm, setFilterAlgorithm] = useState('all');
    const [searchUserId, setSearchUserId] = useState('');
    const [lastRefresh, setLastRefresh] = useState(null);
    const [showSystemModal, setShowSystemModal] = useState(false);

    useEffect(() => {
        const session = localStorage.getItem('consumerSession');
        if (!session) {
            navigate('/login/user');
            return;
        }
        setConsumerSession(JSON.parse(session));
    }, [navigate]);

    useEffect(() => {
        if (consumerSession) {
            fetchTokens();
        }
    }, [consumerSession, filterStatus, filterAlgorithm, searchUserId]);

    // Auto-refresh tokens every 30 seconds to update expired status
    useEffect(() => {
        if (!consumerSession) return;

        const refreshInterval = setInterval(() => {
            fetchTokens();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(refreshInterval);
    }, [consumerSession, filterStatus, filterAlgorithm, searchUserId]);

    const fetchTokens = async () => {
        setLoading(true);
        setError('');
        try {
            const filters = {};
            if (filterStatus !== 'all') filters.status = filterStatus;
            if (filterAlgorithm !== 'all') filters.algorithm = filterAlgorithm;
            if (searchUserId) filters.user_id = searchUserId;

            const response = await getConsumerTokens(consumerSession.consumerId, filters);
            setTokens(response.tokens || []);
            setLastRefresh(new Date());
        } catch (err) {
            setError(err.message || 'Failed to fetch tokens');
            console.error('Error fetching tokens:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('consumerSession');
        navigate('/');
    };

    const handleGenerateToken = () => {
        setShowSystemModal(true);
    };

    const handleSelectJavaScript = () => {
        setShowSystemModal(false);
        navigate('/dashboard/integration-test');
    };

    const handleSelectPython = () => {
        setShowSystemModal(false);
        // Redirect to Python Flask system with consumer_id as URL parameter
        const consumerId = consumerSession.consumerId;
        window.location.href = `http://172.17.58.79:5000?consumer_id=${consumerId}`;
    };

    const handleValidateToken = async (token) => {
        try {
            const result = await validateToken(token);
            alert(`Token is ${result.valid ? 'VALID' : 'INVALID'}${result.reason ? ` (${result.reason})` : ''}`);
        } catch (err) {
            alert('Failed to validate token: ' + err.message);
        }
    };

    const handleRevokeToken = async (token) => {
        if (!confirm('Are you sure you want to revoke this token?')) return;

        try {
            await revokeToken(token);
            alert('Token revoked successfully');
            fetchTokens(); // Refresh the list
        } catch (err) {
            alert('Failed to revoke token: ' + err.message);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusBadgeStyle = (status) => {
        const baseStyle = {
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: '600',
            display: 'inline-block'
        };

        switch (status) {
            case 'active':
                return { ...baseStyle, background: '#10b981', color: 'white' };
            case 'expired':
                return { ...baseStyle, background: '#f59e0b', color: 'white' };
            case 'revoked':
                return { ...baseStyle, background: '#ef4444', color: 'white' };
            default:
                return { ...baseStyle, background: '#6b7280', color: 'white' };
        }
    };

    if (!consumerSession) {
        return null;
    }

    // Get unique algorithms for filter
    const uniqueAlgorithms = [...new Set(tokens.map(t => t.algorithm))];

    return (
        <div className="app">
            <ThemeToggle />
            <header className="app-header">
                <div className="consumer-header-content">
                    <div>
                        <h1>Consumer Dashboard</h1>
                        <p>View and manage all tokens for your application</p>
                    </div>
                    <div className="consumer-header-actions">
                        <div className="consumer-info">
                            <p className="consumer-name">{consumerSession.consumerName}</p>
                            <p className="consumer-email">{consumerSession.email}</p>
                        </div>
                        <div className="consumer-buttons">
                            <button onClick={handleGenerateToken} className="btn-generate">
                                Generate Token
                            </button>
                            <button onClick={handleLogout} className="btn-logout">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="consumer-container">
                {/* Stats Cards Section */}
                <div className="consumer-stats-grid">
                    <div className="consumer-stat-card">
                        <h3 className="stat-number">{tokens.length}</h3>
                        <p className="stat-label">Total Tokens</p>
                    </div>
                    <div className="consumer-stat-card stat-active">
                        <h3 className="stat-number">{tokens.filter(t => t.status === 'active').length}</h3>
                        <p className="stat-label">Active Tokens</p>
                    </div>
                    <div className="consumer-stat-card stat-expired">
                        <h3 className="stat-number">{tokens.filter(t => t.status === 'expired').length}</h3>
                        <p className="stat-label">Expired Tokens</p>
                    </div>
                    <div className="consumer-stat-card stat-revoked">
                        <h3 className="stat-number">{tokens.filter(t => t.status === 'revoked').length}</h3>
                        <p className="stat-label">Revoked Tokens</p>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="consumer-filters-card">
                    <h3>Filters</h3>
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label>Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="revoked">Revoked</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Algorithm</label>
                            <select
                                value={filterAlgorithm}
                                onChange={(e) => setFilterAlgorithm(e.target.value)}
                            >
                                <option value="all">All Algorithms</option>
                                {uniqueAlgorithms.map(algo => (
                                    <option key={algo} value={algo}>{algo}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>User ID</label>
                            <input
                                type="text"
                                placeholder="Search by User ID"
                                value={searchUserId}
                                onChange={(e) => setSearchUserId(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Tokens Table Section */}
                <div className="consumer-tokens-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>All Tokens ({tokens.length})</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {lastRefresh && (
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Last updated: {lastRefresh.toLocaleTimeString()}
                                </span>
                            )}
                            <button
                                onClick={fetchTokens}
                                disabled={loading}
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.85rem',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.6 : 1
                                }}
                            >
                                {loading ? '↻ Refreshing...' : '↻ Refresh'}
                            </button>
                        </div>
                    </div>

                    {loading && <p className="loading-text">Loading tokens...</p>}
                    {error && <div className="error-message">{error}</div>}

                    {!loading && !error && tokens.length === 0 && (
                        <p className="no-tokens-message">
                            No tokens found. Click "Generate Token" to create your first token.
                        </p>
                    )}

                    {!loading && !error && tokens.length > 0 && (
                        <div className="tokens-table-wrapper">
                            <table className="tokens-table">
                                <thead>
                                    <tr>
                                        <th>Token</th>
                                        <th>User ID</th>
                                        <th>Algorithm</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Expires</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tokens.map((token, index) => (
                                        <tr key={index}>
                                            <td className="token-cell">
                                                {token.Token.substring(0, 20)}...
                                            </td>
                                            <td>{token.User_id || 'N/A'}</td>
                                            <td className="algorithm-cell">{token.algorithm}</td>
                                            <td>
                                                <span style={getStatusBadgeStyle(token.status)}>
                                                    {token.status}
                                                </span>
                                            </td>
                                            <td className="date-cell">{formatDate(token.Issued_at)}</td>
                                            <td className="date-cell">
                                                {token.expires_at ? formatDate(token.expires_at) :
                                                    token.expiry_time ? formatDate(token.expiry_time) :
                                                        formatDate(new Date(new Date(token.Issued_at).getTime() + token.Validity * 60000))}
                                            </td>
                                            <td>
                                                <div className="token-actions">
                                                    <button
                                                        onClick={() => handleValidateToken(token.Token)}
                                                        className="btn-action btn-validate"
                                                    >
                                                        Validate
                                                    </button>
                                                    {token.status === 'active' && (
                                                        <button
                                                            onClick={() => handleRevokeToken(token.Token)}
                                                            className="btn-action btn-revoke"
                                                        >
                                                            Revoke
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* System Selection Modal */}
            {showSystemModal && (
                <div className="modal-backdrop" onClick={() => setShowSystemModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                            Choose Token Generation System
                        </h2>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
                            Select which system you'd like to use for generating tokens:
                        </p>

                        <div className="system-options">
                            <button
                                className="system-option-btn javascript-btn"
                                onClick={handleSelectJavaScript}
                            >
                                <div className="system-icon">🧪</div>
                                <h3>API Integration Testbed</h3>
                                <p>Simulate requests before adding to your system</p>
                            </button>

                            <button
                                className="system-option-btn python-btn"
                                onClick={handleSelectPython}
                            >
                                <div className="system-icon">🐍</div>
                                <h3>Python (Flask)</h3>
                                <p>Alternative Flask-based token generation</p>
                            </button>
                        </div>

                        <button
                            className="modal-close-btn"
                            onClick={() => setShowSystemModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <footer className="app-footer">
                <p>SIMULATION OF TOKEN GENERATION SYSTEM</p>
            </footer>
        </div>
    );
}

export default ConsumerDashboard;
