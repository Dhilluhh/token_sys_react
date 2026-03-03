import React, { useEffect, useState } from 'react';
import { getAlgorithms } from '../api';

export default function AlgorithmSelector({ value, onChange }) {
    const [algorithms, setAlgorithms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchAlgorithms() {
            try {
                const algos = await getAlgorithms();
                setAlgorithms(algos);

                // Set first algorithm as default
                if (algos.length > 0 && !value) {
                    onChange(algos[0].name);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchAlgorithms();
    }, []);

    if (loading) {
        return (
            <div className="form-group">
                <label>Algorithm</label>
                <div className="loading">Loading algorithms...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="form-group">
                <label>Algorithm</label>
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="form-group">
            <label htmlFor="algorithm">Algorithm</label>
            <select
                id="algorithm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required
            >
                {algorithms.map((algo) => (
                    <option key={algo.name} value={algo.name}>
                        {algo.name} - {algo.description}
                    </option>
                ))}
            </select>
        </div>
    );
}
