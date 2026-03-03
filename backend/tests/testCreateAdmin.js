// Test creating a new admin via API
const API_BASE_URL = 'http://localhost:3000';

async function testCreateAdmin() {
    console.log('Testing Create Admin API...\n');

    try {
        // First, login as admin1 to get admin ID
        console.log('Step 1: Logging in as admin1...');
        const loginResponse = await fetch(`${API_BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier: 'admin1',
                Password: 'admin123'
            })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
            console.log('❌ Login Failed');
            return;
        }

        console.log('✅ Login Successful');
        console.log('Admin ID:', loginData.admin.Admin_ID);

        // Create a new admin
        console.log('\nStep 2: Creating new admin...');
        const createResponse = await fetch(`${API_BASE_URL}/api/admin/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Username: 'admin3',
                Email: 'admin3@tokensystem.com',
                Password: 'testpass123',
                createdByAdminId: loginData.admin.Admin_ID
            })
        });

        const createData = await createResponse.json();

        if (createResponse.ok) {
            console.log('✅ Admin Created Successfully!');
            console.log('\nNew Admin Details:');
            console.log('  - ID:', createData.admin.Admin_ID);
            console.log('  - Username:', createData.admin.Username);
            console.log('  - Email:', createData.admin.Email);
            console.log('  - Created By:', createData.admin.created_by);
        } else {
            console.log('❌ Admin Creation Failed');
            console.log('Error:', createData.error);
        }

        // Get all admins
        console.log('\nStep 3: Fetching all admins...');
        const listResponse = await fetch(`${API_BASE_URL}/api/admin/list`);
        const listData = await listResponse.json();

        if (listResponse.ok) {
            console.log(`✅ Found ${listData.count} admin(s):`);
            listData.admins.forEach(admin => {
                console.log(`  - ${admin.Username} (${admin.Email}) - ${admin.status}`);
            });
        }

    } catch (error) {
        console.error('❌ Request Failed:', error.message);
        console.error('\nMake sure the backend server is running on port 3000');
    }
}

testCreateAdmin();
