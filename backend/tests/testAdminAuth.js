const Admin = require('../models/Admin');

/**
 * Test script to verify admin authentication
 */

async function testAdminAuth() {
    console.log('Testing Admin Authentication System\n');
    console.log('='.repeat(50));

    try {
        // Test 1: Find admin by username
        console.log('\n1. Testing findAdminByUsername...');
        const admin1 = await Admin.findAdminByUsername('admin1');
        if (admin1) {
            console.log('✓ Found admin1:', {
                Admin_ID: admin1.Admin_ID,
                Username: admin1.Username,
                Email: admin1.Email,
                status: admin1.status
            });
        } else {
            console.log('✗ admin1 not found');
        }

        // Test 2: Find admin by email
        console.log('\n2. Testing findAdminByEmail...');
        const admin2 = await Admin.findAdminByEmail('admin2@tokensystem.com');
        if (admin2) {
            console.log('✓ Found admin2:', {
                Admin_ID: admin2.Admin_ID,
                Username: admin2.Username,
                Email: admin2.Email,
                status: admin2.status
            });
        } else {
            console.log('✗ admin2 not found');
        }

        // Test 3: Verify password
        console.log('\n3. Testing password verification...');
        const isValidPassword = await Admin.verifyPassword('admin123', admin1.Password_hash);
        console.log('✓ Password verification:', isValidPassword ? 'PASSED' : 'FAILED');

        const isInvalidPassword = await Admin.verifyPassword('wrongpassword', admin1.Password_hash);
        console.log('✓ Wrong password rejection:', !isInvalidPassword ? 'PASSED' : 'FAILED');

        // Test 4: Get all admins
        console.log('\n4. Testing getAllAdmins...');
        const allAdmins = await Admin.getAllAdmins();
        console.log(`✓ Found ${allAdmins.length} admin(s):`);
        allAdmins.forEach(admin => {
            console.log(`  - ${admin.Username} (${admin.Email}) - ${admin.status}`);
        });

        // Test 5: Create new admin
        console.log('\n5. Testing createAdmin...');
        try {
            const newAdmin = await Admin.createAdmin({
                Username: 'testadmin',
                Email: 'test@tokensystem.com',
                Password: 'testpass123'
            }, admin1.Admin_ID);
            console.log('✓ Created new admin:', {
                Admin_ID: newAdmin.Admin_ID,
                Username: newAdmin.Username,
                Email: newAdmin.Email
            });

            // Clean up - delete test admin
            const { pool } = require('../database/db');
            await pool.query('DELETE FROM Admins WHERE Username = ?', ['testadmin']);
            console.log('✓ Test admin cleaned up');
        } catch (error) {
            console.log('✗ Admin creation failed:', error.message);
        }

        console.log('\n' + '='.repeat(50));
        console.log('All tests completed!\n');

    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        process.exit(0);
    }
}

testAdminAuth();
