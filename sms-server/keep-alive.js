// Keep-alive service to prevent Render from sleeping
// Run this as a separate service or cron job

const fetch = require('node-fetch');

const SMS_SERVER_URL = process.env.SMS_SERVER_URL || 'https://your-sms-server.onrender.com';

async function keepAlive() {
  try {
    console.log('Pinging SMS server to keep it alive...');
    const response = await fetch(`${SMS_SERVER_URL}/health`);
    const data = await response.json();
    console.log('SMS server is alive:', data);
  } catch (error) {
    console.error('Failed to ping SMS server:', error.message);
  }
}

// Ping every 10 minutes
setInterval(keepAlive, 10 * 60 * 1000);

// Initial ping
keepAlive();

console.log('Keep-alive service started. Pinging every 10 minutes.');
