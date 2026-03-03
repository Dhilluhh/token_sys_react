const { pool } = require('../db');

/**
 * Migration: Add Admins table
 * This migration creates the Admins table and inserts 2 initial admin accounts
 */

async function up() {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        console.log('Creating Admins table...');

        // Create Admins table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Admins (
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
            )
        `);

        console.log('Admins table created successfully');

        // Check if admins already exist
        const [existingAdmins] = await connection.query('SELECT COUNT(*) as count FROM Admins');

        if (existingAdmins[0].count === 0) {
            console.log('Inserting initial admin accounts...');

            // Insert initial 2 admin accounts
            // Password: admin123
            await connection.query(`
                INSERT INTO Admins (Username, Email, Password_hash, created_by) VALUES
                ('admin1', 'admin1@tokensystem.com', '$2b$10$KGd3Mmf2rAJMtXgYhp2qx.s4MI5nYd83hIov8GYDgNM3v0rlL8QUi', NULL),
                ('admin2', 'admin2@tokensystem.com', '$2b$10$KGd3Mmf2rAJMtXgYhp2qx.s4MI5nYd83hIov8GYDgNM3v0rlL8QUi', NULL)
            `);

            console.log('Initial admin accounts created successfully');
            console.log('  Username: admin1, Email: admin1@tokensystem.com, Password: admin123');
            console.log('  Username: admin2, Email: admin2@tokensystem.com, Password: admin123');
        } else {
            console.log(`Admins table already has ${existingAdmins[0].count} admin(s), skipping initial insert`);
        }

        await connection.commit();
        console.log('Migration completed successfully!');

    } catch (error) {
        await connection.rollback();
        console.error('Migration failed:', error.message);
        throw error;
    } finally {
        connection.release();
    }
}

async function down() {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        console.log('Dropping Admins table...');
        await connection.query('DROP TABLE IF EXISTS Admins');
        console.log('Admins table dropped successfully');

        await connection.commit();
        console.log('Rollback completed successfully!');

    } catch (error) {
        await connection.rollback();
        console.error('Rollback failed:', error.message);
        throw error;
    } finally {
        connection.release();
    }
}

// Run migration if called directly
if (require.main === module) {
    const command = process.argv[2];

    if (command === 'up') {
        up()
            .then(() => {
                console.log('\n✓ Migration completed');
                process.exit(0);
            })
            .catch((error) => {
                console.error('\n✗ Migration failed:', error.message);
                process.exit(1);
            });
    } else if (command === 'down') {
        down()
            .then(() => {
                console.log('\n✓ Rollback completed');
                process.exit(0);
            })
            .catch((error) => {
                console.error('\n✗ Rollback failed:', error.message);
                process.exit(1);
            });
    } else {
        console.log('Usage: node add_admins_table.js [up|down]');
        console.log('  up   - Create Admins table and insert initial admins');
        console.log('  down - Drop Admins table');
        process.exit(1);
    }
}

module.exports = { up, down };
