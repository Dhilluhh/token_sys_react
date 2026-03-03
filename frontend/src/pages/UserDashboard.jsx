import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TokenForm from '../components/TokenForm';
import TokenResult from '../components/TokenResult';
import History from '../components/History';
import ThemeToggle from '../components/ThemeToggle';

function UserDashboard() {
    const navigate = useNavigate();
    const [currentToken, setCurrentToken] = useState(null);
    const [consumerSession, setConsumerSession] = useState(null);

    useEffect(() => {
        const session = localStorage.getItem('consumerSession');
        if (!session) {
            navigate('/login/user');
            return;
        }
        setConsumerSession(JSON.parse(session));
    }, [navigate]);

    const handleTokenGenerated = (tokenData) => {
        setCurrentToken(tokenData);

        // Add to history
        if (window.addToTokenHistory) {
            window.addToTokenHistory(tokenData);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('consumerSession');
        navigate('/');
    };

    if (!consumerSession) {
        return null; // or a loading spinner
    }

    return (
        <div className="app">
            <ThemeToggle />
            <header className="app-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px' }}>
                    <div>
                        <h1>Token Generation System</h1>
                        <p>Generate secure tokens using multiple algorithms</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <strong>{consumerSession.consumerName}</strong>
                        </p>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {consumerSession.email}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => navigate('/dashboard/consumer')}
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
                                Back to Dashboard
                            </button>
                            <button
                                onClick={handleLogout}
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

            <div className="app-container">
                <div className="main-section">
                    <TokenForm onTokenGenerated={handleTokenGenerated} />
                    <TokenResult tokenData={currentToken} />
                </div>

                <aside className="sidebar">
                    <History />
                </aside>
            </div>

            <footer className="app-footer">
                <p>SIMULATION OF TOKEN GENERATION SYSTEM</p>
            </footer>
        </div>
    );
}

export default UserDashboard;
