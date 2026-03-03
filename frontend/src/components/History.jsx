import React, { useState, useEffect } from 'react';

const HISTORY_KEY = 'token_history';
const MAX_HISTORY = 10;

export default function History() {
    const [history, setHistory] = useState([]);
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        try {
            const stored = localStorage.getItem(HISTORY_KEY);
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (err) {
            console.error('Failed to load history:', err);
        }
    };

    const addToHistory = (tokenData) => {
        try {
            const entry = {
                ...tokenData,
                timestamp: new Date().toISOString()
            };

            const newHistory = [entry, ...history].slice(0, MAX_HISTORY);
            setHistory(newHistory);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        } catch (err) {
            console.error('Failed to save to history:', err);
        }
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
    };

    const copyToken = async (token, index) => {
        try {
            await navigator.clipboard.writeText(token);
            setCopied(index);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Expose addToHistory for parent component
    React.useEffect(() => {
        window.addToTokenHistory = addToHistory;
        return () => {
            delete window.addToTokenHistory;
        };
    }, [history]);

    if (history.length === 0) {
        return (
            <div className="history">
                <h3>Recent Tokens</h3>
                <p className="empty-message">No tokens generated yet</p>
            </div>
        );
    }

    return (
        <div className="history">
            <div className="history-header">
                <h3>Recent Tokens</h3>
                <button className="btn-clear" onClick={clearHistory}>
                    Clear History
                </button>
            </div>

            <div className="history-list">
                {history.map((entry, index) => (
                    <div key={index} className="history-item">
                        <div className="history-token">
                            <span className="token-text">{entry.token}</span>
                            <button
                                className="btn-copy-small"
                                onClick={() => copyToken(entry.token, index)}
                                title="Copy"
                            >
                                {copied === index ? '✓' : '📋'}
                            </button>
                        </div>
                        <div className="history-meta">
                            <span className="algo-badge">{entry.algorithm}</span>
                            <span className="timestamp">
                                {new Date(entry.timestamp).toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
