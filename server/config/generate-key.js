import crypto from 'crypto';

// Generate a 256-bit key for AES-256
const key = crypto.randomBytes(32).toString('hex');

console.log('Add this key to your .env file:');
console.log('MESSAGE_ENCRYPTION_KEY=' + key);