import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { registerConsumer } from '../api';

function UserRegister() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        appName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.appName || !formData.email || !formData.password) {
            setError('All fields are required');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await registerConsumer({
                appName: formData.appName,
                email: formData.email,
                password: formData.password
            });

            console.log('Registration successful:', response);
            setSuccess(response.consumer);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login/user');
            }, 3000);

        } catch (err) {
            setError(err.message || 'Failed to register. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app">
            <ThemeToggle />
            <div className="login-container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '2rem'
            }}>
                <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ color: 'var(--text-secondary)' }}>Register your application for token access</h2>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {success && (
                        <div style={{
                            padding: '1.5rem',
                            background: 'var(--success)',
                            color: 'white',
                            borderRadius: 'var(--radius-sm)',
                            marginBottom: '1.5rem'
                        }}>
                            <h3 style={{ marginBottom: '1rem', color: 'white' }}>✓ Registration Successful!</h3>
                            <p style={{ marginBottom: '0.5rem' }}><strong>Application:</strong> {success.Consumer_Name}</p>
                            <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {success.Contact}</p>
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: 'var(--radius-sm)'
                            }}>
                                <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}><strong>Your API Key:</strong></p>
                                <code style={{
                                    display: 'block',
                                    padding: '0.5rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '4px',
                                    wordBreak: 'break-all',
                                    fontSize: '0.85rem'
                                }}>{success.api_key}</code>
                                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', opacity: 0.9 }}>
                                    Save this API key! You'll need it for API authentication.
                                </p>
                            </div>
                            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Redirecting to login...</p>
                        </div>
                    )}

                    {!success && (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="appName">Application Name</label>
                                <input
                                    id="appName"
                                    type="text"
                                    name="appName"
                                    placeholder="e.g. My Service"
                                    value={formData.appName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm</label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                                {loading ? 'Registering...' : 'Register Application'}
                            </button>
                        </form>
                    )}

                    <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Already have an account?{' '}
                            <a href="/login/user" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                                Log in
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserRegister;
