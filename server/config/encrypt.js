// encryption-utils.js
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// Get encryption key from environment variables
const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY;
const IV_LENGTH = 16; // For AES, this is always 16
const AUTH_TAG_LENGTH = 16; // For GCM mode

// Encrypt text before storing in database
export const encryptMessage = (text) => {
  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher using AES-256-GCM (authenticated encryption)
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Return all components needed for decryption
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
};

// Decrypt text when retrieving from database
export const decryptMessage = (encryptedData, iv, authTag) => {
  try {
    // Create decipher with the same key, IV, and algorithm
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm', 
      Buffer.from(ENCRYPTION_KEY, 'hex'), 
      Buffer.from(iv, 'hex')
    );
    
    // Set authentication tag
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
};