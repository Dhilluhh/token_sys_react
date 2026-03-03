import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { loginAdmin } from '../api';

function AdminLogin() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Call the real admin login API
            const response = await loginAdmin({
                identifier: credentials.identifier,
                password: credentials.password
            });

            // Store admin session data in localStorage
            localStorage.setItem('adminId', response.admin.Admin_ID);
            localStorage.setItem('adminUsername', response.admin.Username);
            localStorage.setItem('adminEmail', response.admin.Email);
            localStorage.setItem('isAdmin', 'true');

            console.log('Admin logged in successfully:', response.admin.Username);

            // Navigate to admin dashboard
            navigate('/dashboard/admin');
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app">
            <ThemeToggle />
            <div className="login-container" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '80vh'
            }}>
                <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', borderTop: '4px solid #f44336' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Login</h2>

                    {error && (
                        <div className="error-message" style={{
                            marginBottom: '1rem',
                            padding: '0.75rem',
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            border: '1px solid #f44336',
                            borderRadius: '4px',
                            color: '#f44336'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Username or Email</label>
                            <input
                                type="text"
                                name="identifier"
                                value={credentials.identifier}
                                onChange={handleChange}
                                placeholder="admin or admin@tokensystem.com"
                                required
                                disabled={loading}
                                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                disabled={loading}
                                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{
                                width: '100%',
                                backgroundColor: loading ? '#ccc' : '#f44336',
                                backgroundImage: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    {/*
                    <div style={{ marginTop: '1.5rem', padding: '0.75rem', backgroundColor: 'rgba(33, 150, 243, 0.1)', borderRadius: '4px', fontSize: '0.85rem' }}>
                        <strong>Default Credentials:</strong><br />
                        Username: <code>admin1</code> or <code>admin2</code><br />
                        Password: <code>admin123</code>
                    </div>
                    */}

                    <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <a href="/" style={{ color: 'var(--primary-color)' }}>Back to Home</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;

