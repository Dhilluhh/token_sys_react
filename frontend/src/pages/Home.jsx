import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { getAlgorithms } from '../api';

function Home() {
    const [algorithms, setAlgorithms] = useState([]);

    useEffect(() => {
        getAlgorithms().then(setAlgorithms).catch(console.error);
    }, []);

    return (
        <div className="app">
            <ThemeToggle />
            <header className="app-header">
                <h1>Token Generation System</h1>
                <p>Enterprise-grade Tokenization & Security Platform</p>
            </header>

            <div className="app-container" style={{ display: 'block' }}>
                <section style={{ marginBottom: '4rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary-light)' }}>Secure Access Portal</h2>
                    <p style={{ maxWidth: '800px', margin: '0 auto 2rem', color: 'var(--text-secondary)' }}>
                        Welcome to the centralized token generation system. Please select your access level to proceed.
                    </p>

                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div className="card" style={{
                            width: '300px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            border: '1px solid var(--primary)'
                        }}>
                            <h3>Client Access</h3>
                            <p style={{ color: 'var(--text-muted)' }}>For external systems requiring token generation services.</p>
                            <Link to="/login/user" className="btn-primary" style={{ textAlign: 'center' }}>
                                Login as User
                            </Link>
                        </div>

                        <div className="card" style={{
                            width: '300px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            border: '1px solid var(--error)'
                        }}>
                            <h3>Admin Access</h3>
                            <p style={{ color: 'var(--text-muted)' }}>For system administrators to manage algorithms and logs.</p>
                            <Link to="/login/admin" className="btn-primary" style={{
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, var(--error), #ef4444)'
                            }}>
                                Login as Admin
                            </Link>
                        </div>
                    </div>
                </section>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem',
                    maxWidth: '100%',
                    margin: '0 auto'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
                        <section className="card" style={{ maxWidth: '100%', margin: '0' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-light)' }}>Available Algorithms</h2>
                            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                                {algorithms.length > 0 ? algorithms.map(algo => (
                                    <li key={algo.name} style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                            <strong style={{ color: 'var(--text-primary)', minWidth: '120px' }}>{algo.name}</strong>
                                            <span style={{ fontSize: '0.9rem', flex: 1 }}>{algo.description}</span>
                                        </div>
                                    </li>
                                )) : <p className="loading">Loading algorithms...</p>}
                            </ul>
                        </section>

                        <section className="card" style={{ maxWidth: '100%', margin: '0' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-light)' }}>Specifications of the Tokens</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Token Types Supported</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.8' }}>
                                        • Numeric (0-9)<br />
                                        • Alpha - Upper (A-Z) & Lower (a-z)<br />
                                        • Alpha-Numeric (Combined - Alphabets & Numbers)<br />
                                        • Alpha-Numeric + Special Characters
                                    </p>
                                </div>

                                <div>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Complexity Levels</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.8rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ color: 'var(--success)' }}>Low</strong>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tokens are 4 characters long, size of each token is 8 bytes</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ color: 'var(--secondary)' }}>Medium</strong>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tokens are 6 characters long, size of each token is 12 bytes</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ color: 'var(--error)' }}>High</strong>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tokens are 8 characters long, size of each token is 16 bytes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="card" style={{ maxWidth: '100%', margin: '0 auto', width: '100%' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-light)' }}>How It Works</h2>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                            <p style={{ marginBottom: '1rem', textAlign: 'center' }}>The system utilizes a <strong>Context-Based Generation Engine</strong>.</p>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem',
                                marginTop: '1.5rem'
                            }}>
                                <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-light)' }}>1</div>
                                    <strong>Input Seeds</strong>
                                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>User ID, Timestamp, Purpose</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-light)' }}>2</div>
                                    <strong>Algorithm</strong>
                                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Hashing, Folding, Heap, etc.</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-light)' }}>3</div>
                                    <strong>Entropy</strong>
                                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Complexity injection</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-light)' }}>4</div>
                                    <strong>Output</strong>
                                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Secure Token</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <footer className="app-footer">
                <p>SIMULATION OF TOKEN GENERATION SYSTEM</p>
            </footer>
        </div>
    );
}

export default Home;
