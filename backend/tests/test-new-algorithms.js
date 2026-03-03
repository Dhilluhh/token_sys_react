// Test script for new algorithms
const testCases = [
    {
        algorithm: 'hashv2',
        context: {
            user_id: 'test123',
            purpose: 'AUTHENTICATION',
            role: 'USER',
            complexity: 'M'
        }
    },
    {
        algorithm: 'heap',
        context: {
            user_id: 'test456',
            purpose: 'PAYMENT GATEWAY',
            role: 'ADMIN',
            complexity: 'C'
        }
    },
    {
        algorithm: 'unified',
        context: {
            user_id: 'test789',
            purpose: 'VERIFICATION',
            role: 'USER',
            complexity: 'S'
        }
    }
];

async function testAlgorithms() {
    console.log('Testing new algorithms...\n');

    for (const test of testCases) {
        try {
            const response = await fetch('http://localhost:3000/api/generate-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(test)
            });

            const result = await response.json();

            if (response.ok) {
                console.log(`✓ ${test.algorithm} (${test.context.complexity}):`);
                console.log(`  Token: ${result.token}`);
                console.log(`  Length: ${result.length}`);
                console.log(`  Charset: ${result.charset}\n`);
            } else {
                console.log(`✗ ${test.algorithm} failed:`);
                console.log(`  Error: ${result.error}\n`);
            }
        } catch (error) {
            console.log(`✗ ${test.algorithm} error: ${error.message}\n`);
        }
    }
}

testAlgorithms();
