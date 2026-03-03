-- Migration: Add expires_at column to Tokens table
-- This allows for precise expiry calculation

USE token_system;

-- Add expires_at column
ALTER TABLE Tokens 
ADD COLUMN expires_at TIMESTAMP NULL AFTER Validity;

-- Add index for expires_at for faster queries
ALTER TABLE Tokens 
ADD INDEX idx_expires_at (expires_at);

-- Update existing tokens to have expires_at based on Issued_at + Validity
UPDATE Tokens 
SET expires_at = TIMESTAMPADD(MINUTE, Validity, Issued_at)
WHERE expires_at IS NULL;

-- Optional: Update expired tokens based on new expires_at
UPDATE Tokens 
SET status = 'expired' 
WHERE status = 'active' 
AND expires_at < NOW();
