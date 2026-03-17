import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { generateToken } from '../api';

function ActualIntegration() {
    const navigate = useNavigate();
    const [consumerSession, setConsumerSession] = useState(null);
    const [currentToken, setCurrentToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedLanguage, setSelectedLanguage] = useState('javascript');

    const [formData, setFormData] = useState({
        algorithm: 'random',
        user_id: 'passenger_001',
        purpose: 'OTP',
        validity_value: 30,
        validity_unit: 'minutes',
        charset: 'NUMBER',
        complexity: 'M',
        phone_number: '9874382619' // Needed for SMS payload
    });

    useEffect(() => {
        const session = localStorage.getItem('consumerSession');
        if (!session) {
            navigate('/login/user');
            return;
        }
        setConsumerSession(JSON.parse(session));
    }, [navigate]);

    const handleLanguageChange = (e) => {
        const value = e.target.value;
        setSelectedLanguage(value);
        setFormData(prev => {
            const newData = { ...prev };
            // Auto map current algorithm to its equivalent in the new selected language
            if (value === 'python') {
                if (!newData.algorithm.startsWith('python_')) {
                    if (newData.algorithm === 'hashv2') newData.algorithm = 'python_hashing_v2';
                    else newData.algorithm = `python_${newData.algorithm}`;
                }
            } else {
                if (newData.algorithm.startsWith('python_')) {
                    newData.algorithm = newData.algorithm.replace('python_', '');
                    if (newData.algorithm === 'hashing_v2') newData.algorithm = 'hashv2';
                }
            }
            return newData;
        });
    };

    const handlePurposeChange = (e) => {
        const purpose = e.target.value;
        setFormData(prev => {
            const newData = { ...prev, purpose };

            // Pre-fixed mappings based on purpose
            switch (purpose) {
                case 'OTP':
                    newData.algorithm = selectedLanguage === 'python' ? 'python_random' : 'random';
                    newData.validity_value = 15;
                    newData.validity_unit = 'minutes';
                    break;
                case 'AUTHENTICATION':
                    newData.algorithm = selectedLanguage === 'python' ? 'python_hashing_v2' : 'hashv2';
                    newData.validity_value = 60;
                    newData.validity_unit = 'minutes';
                    break;
                case 'REGISTRATION':
                    newData.algorithm = selectedLanguage === 'python' ? 'python_sequential' : 'sequential';
                    newData.validity_value = 30;
                    newData.validity_unit = 'minutes';
                    break;
                case 'VERIFICATION':
                    newData.algorithm = selectedLanguage === 'python' ? 'python_modulo' : 'modulo';
                    newData.validity_value = 10;
                    newData.validity_unit = 'minutes';
                    break;
                case 'PAYMENT GATEWAY':
                    newData.algorithm = selectedLanguage === 'python' ? 'python_hashing' : 'hashing';
                    newData.validity_value = 15;
                    newData.validity_unit = 'minutes';
                    break;
                case 'COMPLAINT':
                    newData.algorithm = selectedLanguage === 'python' ? 'python_sequential' : 'sequential';
                    newData.validity_value = 7;
                    newData.validity_unit = 'days';
                    break;
            }
            return newData;
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleValidityChange = (e) => {
        let value = parseInt(e.target.value, 10);
        if (value < 1) value = 1;
        setFormData(prev => ({ ...prev, validity_value: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { algorithm, validity_value, validity_unit, ...context } = formData;

            // Calculate minutes
            let validity_minutes = validity_value;
            if (validity_unit === 'hours') validity_minutes = validity_value * 60;
            if (validity_unit === 'days') validity_minutes = validity_value * 24 * 60;

            context.validity_minutes = validity_minutes;

            // Send request
            const data = await generateToken(algorithm, consumerSession.consumerId, context);
            setCurrentToken(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('consumerSession');
        navigate('/');
    };

    if (!consumerSession) return null;

    // Helper to generate the exact JSON payload they would send from their backend
    const getSamplePayload = () => {
        const { algorithm, validity_value, validity_unit, ...context } = formData;
        let validity_minutes = validity_value;
        if (validity_unit === 'hours') validity_minutes = validity_value * 60;
        if (validity_unit === 'days') validity_minutes = validity_value * 24 * 60;

        return JSON.stringify({
            algorithm,
            consumer_id: consumerSession.consumerId,
            context: {
                ...context,
                validity_minutes,
                issue_date: new Date().toISOString().replace('T', ' ').substring(0, 19)
            }
        }, null, 2);
    };

    return (
        <div className="app">
            <ThemeToggle />
            <header className="app-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px' }}>
                    <div>
                        <h1>Actual Integration</h1>
                        <p>Configure and generate actual integration payloads directly.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <strong>{consumerSession.consumerName}</strong>
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => navigate('/dashboard/consumer')}
                                className="btn-action"
                                style={{
                                    padding: '0.4rem 1rem',
                                    fontSize: '0.85rem',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer'
                                }}
                            >
                                Back to Console
                            </button>
                            <button
                                onClick={handleLogout}
                                className="btn-action"
                                style={{
                                    padding: '0.4rem 1rem',
                                    fontSize: '0.85rem',
                                    background: 'var(--error)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer'
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="app-container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '2rem' }}>

                {/* Left Side: Payload Configuration Form */}
                <div style={{ flex: '1', background: 'var(--surface-color)', padding: '2rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
                    <h2>Integration Payload Setup</h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Programming Language</label>
                                <select
                                    name="language"
                                    value={selectedLanguage}
                                    onChange={handleLanguageChange}
                                    style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                </select>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Target Algorithm</label>
                                <select
                                    name="algorithm"
                                    value={formData.algorithm}
                                    onChange={handleChange}
                                    style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                >
                                    {selectedLanguage === 'python' ? (
                                        <>
                                            <option value="python_compression">Compression </option>
                                            <option value="python_folding">Folding </option>
                                            <option value="python_hashing">Hashing </option>
                                            <option value="python_hashing_v2">Hashing v2 </option>
                                            <option value="python_heap">Heap </option>
                                            <option value="python_modulo">Modulo </option>
                                            <option value="python_random">Random </option>
                                            <option value="python_reverse">Reverse </option>
                                            <option value="python_sequential">Sequential </option>
                                            <option value="python_unified">Unified </option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="compression">Compression </option>
                                            <option value="folding">Folding </option>
                                            <option value="hashing">Hashing </option>
                                            <option value="hashv2">Hashing v2 </option>
                                            <option value="heap">Heap </option>
                                            <option value="modulo">Modulo </option>
                                            <option value="random">Random </option>
                                            <option value="reverse">Reverse </option>
                                            <option value="sequential">Sequential </option>
                                            <option value="unified">Unified </option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Purpose</label>
                                <select name="purpose" value={formData.purpose} onChange={handlePurposeChange} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                    <option value="OTP">OTP (One Time Password)</option>
                                    <option value="AUTHENTICATION">Authentication</option>
                                    <option value="REGISTRATION">Registration</option>
                                    <option value="VERIFICATION">Verification</option>
                                    <option value="PAYMENT GATEWAY">Payment Gateway</option>
                                    <option value="COMPLAINT">Complaint</option>
                                </select>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Target User ID</label>
                                <input type="text" name="user_id" value={formData.user_id} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Recipient Phone (SMS)</label>
                                <input type="text" name="phone_number" placeholder="+1234567890" value={formData.phone_number} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Validity Requirement</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="number" name="validity_value" value={formData.validity_value} min="1" onChange={handleValidityChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                                    <select name="validity_unit" value={formData.validity_unit} onChange={handleChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                        <option value="minutes">Minutes</option>
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Character Set & Complexity</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <select name="charset" value={formData.charset} onChange={handleChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                        <option value="NUMBER">Numbers Only</option>
                                        <option value="ALPHANUM">Alphanumeric</option>
                                    </select>
                                    <select name="complexity" value={formData.complexity} onChange={handleChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                        <option value="S">Short (4 chars)</option>
                                        <option value="M">Medium (6 chars)</option>
                                        <option value="C">Complex (8 chars)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}>
                            {loading ? 'Simulating API Call...' : 'Trigger actual token Generation'}
                        </button>
                    </form>

                    {error && <div style={{ marginTop: '1rem', padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '4px' }}>{error}</div>}
                </div>

                {/* Right Side: Payload preview & Response */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* JSON Payload Preview */}
                    <div style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#fff', fontSize: '1.1rem' }}>Integration Details</h3>
                        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            Target Endpoint: POST http://YOUR_SERVER_IP/api/generate-token
                        </p>
                        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            Environment: {selectedLanguage === 'python' ? 'Python / Flask Integration' : 'JavaScript / Node Integration'}
                        </p>
                        <h4 style={{ color: '#fff', fontSize: '1rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Sample Payload Configuration</h4>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                            {getSamplePayload()}
                        </pre>
                    </div>

                    {/* Result Card */}
                    {currentToken && (
                        <div style={{ background: 'var(--surface-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Generated Token</span>
                                <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '12px' }}>
                                    Status: 200 OK
                                </span>
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 'bold', letterSpacing: '4px', color: 'var(--primary)' }}>
                                    {currentToken.token}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                                <div><strong>Algorithm:</strong> {currentToken.algorithm}</div>
                                <div><strong>Valid For:</strong> {currentToken.validity_minutes} mins</div>
                                <div><strong>SMS Triggered:</strong> {currentToken.sms_status === 'sent_successfully' ? '✅ Yes' : '❌ No'}</div>
                                <div><strong>Expires At:</strong> {new Date(currentToken.expires_at).toLocaleString()}</div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default ActualIntegration;
