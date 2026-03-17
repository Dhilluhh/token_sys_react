const http = require('http');

const data = JSON.stringify({
    consumer_id: 2, // client1 from DB
    algorithm: "python_random",
    context: {
        user_id: "bus_passenger_101",
        charset: "NUMBER",
        complexity: "M", // Length 6
        purpose: "OTP",
        phone_number: "9874382619" // Simulates where the SMS should go
    }
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/generate-token',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log('Response from Token System:');
        console.log(JSON.parse(responseData));
    });
});

req.on('error', (error) => {
    console.error('Error triggering request:', error);
});

req.write(data);
req.end();
