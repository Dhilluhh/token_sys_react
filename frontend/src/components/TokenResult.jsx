import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function TokenResult({ tokenData }) {
    const [copied, setCopied] = useState(false);

    if (!tokenData) {
        return null;
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(tokenData.token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDownload = () => {
        const content = `Token: ${tokenData.token}\nAlgorithm: ${tokenData.algorithm}\nLength: ${tokenData.length}\nCharset: ${tokenData.charset}\nGenerated: ${new Date().toLocaleString()}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `token-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadQR = () => {
        const svg = document.getElementById('token-qr-code');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `token-qr-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <div className="token-result">
            <h3>Generated Token</h3>

            <div className="token-display">
                <div className="token-value">{tokenData.token}</div>
                <button
                    className="btn-copy"
                    onClick={handleCopy}
                    title="Copy to clipboard"
                >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
            </div>

            <div className="token-metadata">
                <div className="metadata-item">
                    <span className="label">Algorithm:</span>
                    <span className="value">{tokenData.algorithm}</span>
                </div>
                <div className="metadata-item">
                    <span className="label">Length:</span>
                    <span className="value">{tokenData.length} characters</span>
                </div>
                <div className="metadata-item">
                    <span className="label">Charset:</span>
                    <span className="value">{tokenData.charset}</span>
                </div>
            </div>

            <div className="qr-code-section">
                <h4>QR Code</h4>
                <div className="qr-code-container">
                    <QRCodeSVG
                        id="token-qr-code"
                        value={tokenData.token}
                        size={200}
                        level="H"
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#000000"
                    />
                </div>
                <button className="btn-secondary" onClick={handleDownloadQR}>
                    📥 Download QR Code
                </button>
            </div>

            <button className="btn-secondary" onClick={handleDownload}>
                💾 Download Token as File
            </button>
        </div>
    );
}
