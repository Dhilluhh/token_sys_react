import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AlgorithmSelector from './AlgorithmSelector';
import { generateToken } from '../api';

export default function TokenForm({ onTokenGenerated }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        algorithm: '',
        user_id: '',
        issue_date: '',
        purpose: 'AUTHENTICATION',
        role: 'USER',
        validity_value: 30,
        validity_unit: 'days',
        charset: 'ALPHANUM',
        complexity: 'M'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [consumerSession, setConsumerSession] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const session = localStorage.getItem('consumerSession');
        if (!session) {
            navigate('/login/user');
            return;
        }
        setConsumerSession(JSON.parse(session));
    }, [navigate]);

    const getMaxValidity = () => {
        switch (formData.validity_unit) {
            case 'minutes': return 60;
            case 'hours': return 24;
            case 'days': return 30;
            default: return 30;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleValidityChange = (e) => {
        let value = parseInt(e.target.value, 10);

        // Prevent negative values
        if (value < 1) value = 1;

        // Enforce maximum based on unit
        const max = getMaxValidity();
        if (value > max) value = max;

        setFormData(prev => ({
            ...prev,
            validity_value: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!consumerSession) {
            setError('Session expired. Please login again.');
            setLoading(false);
            return;
        }

        try {
            const { algorithm, validity_value, validity_unit, ...context } = formData;

            // Convert validity to minutes for precise calculation
            let validity_minutes = validity_value;
            if (validity_unit === 'hours') {
                validity_minutes = validity_value * 60;
            } else if (validity_unit === 'days') {
                validity_minutes = validity_value * 24 * 60;
            }
            // If unit is 'minutes', validity_minutes is already correct

            context.validity_minutes = validity_minutes;

            const data = await generateToken(algorithm, consumerSession.consumerId, context);
            onTokenGenerated(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="token-form" onSubmit={handleSubmit}>
            <h2>Generate Token</h2>

            {error && <div className="error-message">{error}</div>}

            <AlgorithmSelector
                value={formData.algorithm}
                onChange={(value) => setFormData(prev => ({ ...prev, algorithm: value }))}
            />

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="user_id">User ID *</label>
                    <input
                        type="text"
                        id="user_id"
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleChange}
                        required
                        placeholder="e.g., alice123"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="issue_date">Issue Date</label>
                    <input
                        type="text"
                        id="issue_date"
                        name="issue_date"
                        value={formData.issue_date}
                        onChange={handleChange}
                        placeholder="YYYY-MM-DD HH:MM:SS"
                    />
                    <small>Leave empty for current time</small>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="purpose">Purpose</label>
                    <select
                        id="purpose"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                    >
                        <option value="AUTHENTICATION">Authentication</option>
                        <option value="REGISTRATION">Registration</option>
                        <option value="VERIFICATION">Verification</option>
                        <option value="PAYMENT GATEWAY">Payment Gateway</option>
                        <option value="COMPLAINT">Complaint</option>
                        <option value="OTP">OTP</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <input
                        type="text"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        placeholder="e.g., ADMIN, USER"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="validity_value">Validity</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="number"
                            id="validity_value"
                            name="validity_value"
                            value={formData.validity_value}
                            onChange={handleValidityChange}
                            min="1"
                            max={getMaxValidity()}
                            required
                            style={{ flex: 1 }}
                        />
                        <select
                            id="validity_unit"
                            name="validity_unit"
                            value={formData.validity_unit}
                            onChange={handleChange}
                            style={{ flex: 1 }}
                        >
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                        </select>
                    </div>
                    <small>
                        {formData.validity_unit === 'minutes' && 'Max: 60 minutes'}
                        {formData.validity_unit === 'hours' && 'Max: 24 hours'}
                        {formData.validity_unit === 'days' && 'Max: 30 days'}
                    </small>
                </div>

                <div className="form-group">
                    <label htmlFor="charset">Character Set</label>
                    <select
                        id="charset"
                        name="charset"
                        value={formData.charset}
                        onChange={handleChange}
                    >
                        <option value="NUMBER">Numbers Only</option>
                        <option value="ALPHA">Letters Only</option>
                        <option value="ALPHANUM">Alphanumeric</option>
                        <option value="SPECIAL">Alphanumeric + Special</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="complexity">Complexity</label>
                <div className="complexity-options">
                    <label className="radio-label">
                        <input
                            type="radio"
                            name="complexity"
                            value="S"
                            checked={formData.complexity === 'S'}
                            onChange={handleChange}
                        />
                        <span>Short (4 chars)</span>
                    </label>
                    <label className="radio-label">
                        <input
                            type="radio"
                            name="complexity"
                            value="M"
                            checked={formData.complexity === 'M'}
                            onChange={handleChange}
                        />
                        <span>Medium (6 chars)</span>
                    </label>
                    <label className="radio-label">
                        <input
                            type="radio"
                            name="complexity"
                            value="C"
                            checked={formData.complexity === 'C'}
                            onChange={handleChange}
                        />
                        <span>Complex (8 chars)</span>
                    </label>
                </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Token'}
            </button>
        </form>
    );
}
