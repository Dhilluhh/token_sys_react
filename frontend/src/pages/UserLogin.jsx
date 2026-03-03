import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { loginConsumer } from '../api';

function UserLogin() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!credentials.email || !credentials.password) {
            setError('Email and password are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await loginConsumer({
                email: credentials.email,
                password: credentials.password
            });

            console.log('Login successful:', response);

            // Store consumer session data
            localStorage.setItem('consumerSession', JSON.stringify({
                consumerId: response.consumer.Consumer_ID,
                consumerName: response.consumer.Consumer_Name,
                email: response.consumer.Contact,
                apiKey: response.consumer.api_key,
                status: response.consumer.status,
                stats: response.stats
            }));

            // Navigate to dashboard
            navigate('/dashboard/consumer');

        } catch (err) {
            setError(err.message || 'Invalid credentials. Please try again.');
            console.error('Login error:', err);
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
                <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>User Login</h2>
                    {error && <div className="error-message" style={{ marginBottom: '1rem', padding: '0.5rem' }}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@company.com"
                                value={credentials.email}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Need an API key?{' '}
                            <a href="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                                Register application
                            </a>
                        </p>
                        <a href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Back to Home</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserLogin;
