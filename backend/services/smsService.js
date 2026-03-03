/**
 * Simulated SMS Service for SOA Architecture
 * In a real environment, this would call a real external SMS API like Twilio or the other team's endpoint.
 */

const SMS_URL = process.env.SMS_SERVICE_URL;

const sendTokenToSMS = async (phoneNumber, token) => {
    // If an external IP/URL is provided in .env, use it!
    if (SMS_URL) {
        console.log(`\n[SOA] Forwarding SMS request to external system: ${SMS_URL}`);
        try {
            // Using modern fetch API (available in Node 18+)
            const response = await fetch(SMS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipient: phoneNumber,
                    message: `Your requested token is: ${token}`,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`External SMS Service responded with status: ${response.status}`);
            }

            const data = await response.json().catch(() => ({}));
            console.log(`[SOA] Successfully delivered to external SMS system!`);
            return data;
        } catch (error) {
            console.error(`[SOA ERROR] Failed to connect to external SMS system:`, error.message);
            throw error;
        }
    }

    // Fallback: If no SMS_SERVICE_URL is defined in .env, just simulate it
    return new Promise((resolve) => {
        console.log(`\n================= SMS SIMULATION =================`);
        console.log(`[EXTERNAL SMS SERVICE TRIGGERED]`);
        console.log(`Sending SMS to: ${phoneNumber}`);
        console.log(`Message Content: "Your scheduled OTP token is: ${token}. Do not share this with anyone."`);
        console.log(`Status: SUCCESS - SMS sent correctly to requestor.`);
        console.log(`==================================================\n`);

        setTimeout(() => {
            resolve({
                status: 'success',
                message_id: 'sms_' + Date.now(),
                delivered_to: phoneNumber,
                simulated: true
            });
        }, 800);
    });
};

module.exports = { sendTokenToSMS };
