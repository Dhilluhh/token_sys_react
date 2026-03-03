import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { getAlgorithms, getConsumerTokens, createAdmin, getAllAdmins } from '../api';

// Create a simple fetch wrapper for admin endpoints
const adminApi = {
    get: async (endpoint) => {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_BASE_URL}/api${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    },
    patch: async (endpoint, data) => {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
};

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [adminInfo, setAdminInfo] = useState(null);

    // State for data
    const [consumers, setConsumers] = useState([]);
    const [algorithms, setAlgorithms] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [systemStats, setSystemStats] = useState({
        totalConsumers: 0,
        activeConsumers: 0,
        totalAlgorithms: 0,
        totalTokens: 0
    });

    // State for create admin form
    const [showCreateAdminForm, setShowCreateAdminForm] = useState(false);
    const [newAdminData, setNewAdminData] = useState({
        username: '',
        email: '',
        password: ''
    });

    // Check authentication and fetch all data on component mount
    useEffect(() => {
        // Check if admin is logged in
        const adminId = localStorage.getItem('adminId');
        const adminUsername = localStorage.getItem('adminUsername');
        const isAdmin = localStorage.getItem('isAdmin');

        if (!adminId || !adminUsername || isAdmin !== 'true') {
            // Not logged in, redirect to admin login
            navigate('/login/admin');
            return;
        }

        // Set admin info
        setAdminInfo({
            id: adminId,
            username: adminUsername,
            email: localStorage.getItem('adminEmail')
        });

        fetchAllData();
    }, [navigate]);

    const fetchAllData = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch consumers
            const consumersData = await adminApi.get('/auth/consumers');
            setConsumers(consumersData.consumers || []);

            // Fetch algorithms
            const algorithmsData = await getAlgorithms();
            setAlgorithms(algorithmsData || []);

            // Fetch admins
            const adminsData = await getAllAdmins();
            setAdmins(adminsData.admins || []);

            // Calculate system stats
            const activeConsumers = consumersData.consumers.filter(c => c.status === 'active').length;

            // Get total tokens from all consumers
            let totalTokens = 0;
            for (const consumer of consumersData.consumers) {
                try {
                    const tokensData = await getConsumerTokens(consumer.Consumer_ID);
                    totalTokens += tokensData.tokens?.length || 0;
                } catch (err) {
                    console.error(`Error fetching tokens for consumer ${consumer.Consumer_ID}:`, err);
                }
            }

            setSystemStats({
                totalConsumers: consumersData.consumers.length,
                activeConsumers,
                totalAlgorithms: algorithmsData.length,
                totalTokens
            });

        } catch (err) {
            console.error('Error fetching admin data:', err);
            setError('Failed to load admin data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (consumerId, newStatus) => {
        try {
            setError('');
            setSuccessMessage('');

            await adminApi.patch(`/auth/status/${consumerId}`, { status: newStatus });

            setSuccessMessage(`Consumer status updated to ${newStatus}`);

            // Refresh consumers list
            const consumersData = await adminApi.get('/auth/consumers');
            setConsumers(consumersData.consumers || []);

            // Update stats
            const activeConsumers = consumersData.consumers.filter(c => c.status === 'active').length;
            setSystemStats(prev => ({
                ...prev,
                activeConsumers
            }));

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error updating consumer status:', err);
            setError('Failed to update consumer status. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleNewAdminChange = (e) => {
        setNewAdminData({
            ...newAdminData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            // Validate form
            if (!newAdminData.username || !newAdminData.email || !newAdminData.password) {
                setError('All fields are required');
                return;
            }

            if (newAdminData.password.length < 8) {
                setError('Password must be at least 8 characters long');
                return;
            }

            // Create new admin
            await createAdmin(newAdminData, adminInfo.id);

            setSuccessMessage('New admin created successfully!');

            // Refresh admins list
            const adminsData = await getAllAdmins();
            setAdmins(adminsData.admins || []);

            // Reset form and hide it
            setNewAdminData({ username: '', email: '', password: '' });
            setShowCreateAdminForm(false);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error creating admin:', err);
            setError(err.message || 'Failed to create admin. Please try again.');
        }
    };

    const renderOverview = () => (
        <div className="admin-overview">
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Consumers</h3>
                    <p className="stat-number">{systemStats.totalConsumers}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Consumers</h3>
                    <p className="stat-number">{systemStats.activeConsumers}</p>
                </div>
                <div className="stat-card">
                    <h3>Available Algorithms</h3>
                    <p className="stat-number">{systemStats.totalAlgorithms}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Tokens Generated</h3>
                    <p className="stat-number">{systemStats.totalTokens}</p>
                </div>
            </div>
        </div>
    );

    const renderConsumers = () => (
        <div className="consumers-section">
            <h2>All Consumers</h2>
            {consumers.length === 0 ? (
                <p className="no-data">No consumers registered yet.</p>
            ) : (
                <div className="consumers-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th>Registered At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {consumers.map(consumer => (
                                <tr key={consumer.Consumer_ID}>
                                    <td>{consumer.Consumer_ID}</td>
                                    <td>{consumer.Consumer_Name}</td>
                                    <td>{consumer.Contact}</td>
                                    <td>
                                        <span className={`status-badge status-${consumer.status}`}>
                                            {consumer.status}
                                        </span>
                                    </td>
                                    <td>{new Date(consumer.registered_at).toLocaleDateString()}</td>
                                    <td>
                                        <select
                                            value={consumer.status}
                                            onChange={(e) => handleStatusChange(consumer.Consumer_ID, e.target.value)}
                                            className="status-select"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderAlgorithms = () => (
        <div className="algorithms-section">
            <h2>Available Algorithms</h2>
            {algorithms.length === 0 ? (
                <p className="no-data">No algorithms available.</p>
            ) : (
                <div className="algorithms-grid">
                    {algorithms.map((algo, index) => (
                        <div key={index} className="algorithm-card">
                            <h3>{algo.name}</h3>
                            <p>{algo.description}</p>
                            <div className="algorithm-meta">
                                <span className="algorithm-badge">Available</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderAdmins = () => (
        <div className="admins-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Admin Management</h2>
                <button
                    onClick={() => setShowCreateAdminForm(!showCreateAdminForm)}
                    className="btn-primary"
                    style={{ backgroundColor: '#4CAF50', backgroundImage: 'none' }}
                >
                    {showCreateAdminForm ? 'Cancel' : '+ Create New Admin'}
                </button>
            </div>

            {showCreateAdminForm && (
                <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', borderTop: '4px solid #4CAF50' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Create New Admin</h3>
                    <form onSubmit={handleCreateAdmin}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={newAdminData.username}
                                onChange={handleNewAdminChange}
                                placeholder="Enter username (3-20 characters)"
                                required
                                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={newAdminData.email}
                                onChange={handleNewAdminChange}
                                placeholder="Enter email address"
                                required
                                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={newAdminData.password}
                                onChange={handleNewAdminChange}
                                placeholder="Enter password (min 8 characters)"
                                required
                                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ backgroundColor: '#4CAF50', backgroundImage: 'none' }}
                        >
                            Create Admin
                        </button>
                    </form>
                </div>
            )}

            <h3 style={{ marginBottom: '1rem' }}>Existing Admins ({admins.length})</h3>
            {admins.length === 0 ? (
                <p className="no-data">No admins found.</p>
            ) : (
                <div className="consumers-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Created At</th>
                                <th>Last Login</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(admin => (
                                <tr key={admin.Admin_ID}>
                                    <td>{admin.Admin_ID}</td>
                                    <td><strong>{admin.Username}</strong></td>
                                    <td>{admin.Email}</td>
                                    <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                                    <td>{admin.last_login ? new Date(admin.last_login).toLocaleDateString() : 'Never'}</td>
                                    <td>
                                        <span className={`status-badge status-${admin.status}`}>
                                            {admin.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="app">
                <ThemeToggle />
                <header className="app-header">
                    <h1>Admin Dashboard</h1>
                    <p>Manage the Token Generation System</p>
                </header>
                <div className="admin-container">
                    <div className="loading-container">
                        <p>Loading admin data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <ThemeToggle />
            <header className="app-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Manage the Token Generation System</p>
                    {adminInfo && (
                        <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                            Logged in as: <strong>{adminInfo.username}</strong>
                        </p>
                    )}
                </div>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </header>

            <div className="admin-container">
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <div className="admin-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'consumers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('consumers')}
                    >
                        Consumers ({consumers.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'algorithms' ? 'active' : ''}`}
                        onClick={() => setActiveTab('algorithms')}
                    >
                        Algorithms ({algorithms.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'admins' ? 'active' : ''}`}
                        onClick={() => setActiveTab('admins')}
                    >
                        Admins ({admins.length})
                    </button>
                </div>

                <div className="admin-content">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'consumers' && renderConsumers()}
                    {activeTab === 'algorithms' && renderAlgorithms()}
                    {activeTab === 'admins' && renderAdmins()}
                </div>
            </div>

            <footer className="app-footer">
                <p>SIMULATION OF TOKEN GENERATION SYSTEM - ADMIN</p>
            </footer>
        </div>
    );
}

export default AdminDashboard;
