// Quick test to verify admin login API endpoint
const API_BASE_URL = 'http://localhost:3000';

async function testAdminLogin() {
    console.log('Testing Admin Login API...\n');

    try {
        console.log('Attempting login with admin1/admin123...');

        const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier: 'admin1',
                Password: 'admin123'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Login Successful!');
            console.log('\nResponse:', JSON.stringify(data, null, 2));
            console.log('\nAdmin Details:');
            console.log('  - ID:', data.admin.Admin_ID);
            console.log('  - Username:', data.admin.Username);
            console.log('  - Email:', data.admin.Email);
        } else {
            console.log('❌ Login Failed');
            console.log('Error:', data.error);
        }
    } catch (error) {
        console.error('❌ Request Failed:', error.message);
        console.error('\nMake sure the backend server is running on port 3000');
    }
}

testAdminLogin();
