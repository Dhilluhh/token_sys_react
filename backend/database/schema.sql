-- Create Database
CREATE DATABASE IF NOT EXISTS token_system;
USE token_system;

-- Table 1: Admins
CREATE TABLE Admins (
    Admin_ID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) UNIQUE NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    last_login TIMESTAMP NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    INDEX idx_username (Username),
    INDEX idx_email (Email),
    FOREIGN KEY (created_by) REFERENCES Admins(Admin_ID) ON DELETE SET NULL
);

-- Insert initial 2 admin accounts (password: admin123)
-- Password hash for 'admin123' using bcrypt with salt rounds 10
INSERT INTO Admins (Username, Email, Password_hash, created_by) VALUES
('admin1', 'admin1@tokensystem.com', '$2b$10$KGd3Mmf2rAJMtXgYhp2qx.s4MI5nYd83hIov8GYDgNM3v0rlL8QUi', NULL),
('admin2', 'admin2@tokensystem.com', '$2b$10$KGd3Mmf2rAJMtXgYhp2qx.s4MI5nYd83hIov8GYDgNM3v0rlL8QUi', NULL);

-- Table 2: Consumer_Registry
CREATE TABLE Consumer_Registry (
    Consumer_ID INT AUTO_INCREMENT PRIMARY KEY,
    Consumer_Name VARCHAR(255) NOT NULL,
    Contact VARCHAR(255) UNIQUE NOT NULL,
    Password_hash VARCHAR(255) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    api_key VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_api_key (api_key),
    INDEX idx_consumer_name (Consumer_Name)
);

-- Table 2: Tokens
CREATE TABLE Tokens (
    Token_ID INT AUTO_INCREMENT PRIMARY KEY,
    Token VARCHAR(500) UNIQUE NOT NULL,
    Consumer_ID INT NOT NULL,
    User_id VARCHAR(255) NOT NULL,
    purpose VARCHAR(100),
    Issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Validity INT,
    expires_at TIMESTAMP NULL,
    role VARCHAR(100),
    complexity VARCHAR(10),
    algorithm VARCHAR(50),
    status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Consumer_ID) REFERENCES Consumer_Registry(Consumer_ID) ON DELETE CASCADE,
    INDEX idx_consumer_id (Consumer_ID),
    INDEX idx_user_id (User_id),
    INDEX idx_token (Token),
    INDEX idx_issued_at (Issued_at),
    INDEX idx_expires_at (expires_at),
    INDEX idx_status (status)
);

