import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Constants
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const ENCODING = 'hex';

// Get encryption key from environment variables with safer fallback handling
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  console.warn('WARNING: No encryption key found in environment variables. Using fallback key - NOT SECURE FOR PRODUCTION!');
}

// Initialize encryption key with validation
const getValidEncryptionKey = () => {
  const key = ENCRYPTION_KEY || "f3f091aff0f112d38f0336ca50e094fc215e11fea3264a71cc6168a2f0701b43";
  const keyBuffer = Buffer.from(key, ENCODING);
  
  if (keyBuffer.length !== 32) {
    throw new Error('Invalid encryption key length. Must be 32 bytes (64 hex characters).');
  }
  
  return keyBuffer;
};

// Validate key on module load
let encryptionKeyBuffer;
try {
  encryptionKeyBuffer = getValidEncryptionKey();
} catch (error) {
  console.error('CRITICAL ERROR: Invalid encryption configuration:', error.message);
  throw error; // Re-throw to prevent app from starting with invalid encryption
}

/**
 * Encrypt text before storing in the database.
 * @param {string} text - The plaintext to encrypt.
 * @returns {Object} - An object containing the encrypted text, IV, and authentication tag.
 * @throws {Error} - If encryption fails.
 */
export const encryptMessage = (text) => {
  if (typeof text !== 'string') {
    throw new TypeError('Encryption requires a string input');
  }
  
  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher using AES-256-GCM
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKeyBuffer, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);
    
    // Get authentication tag
    const authTag = cipher.getAuthTag().toString(ENCODING);
    
    // Return all components needed for decryption
    return {
      text: encrypted,  // Renamed to match the property name in your schema
      iv: iv.toString(ENCODING),
      authTag,
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error(`Failed to encrypt message: ${process.env.NODE_ENV === 'development' ? error.message : 'Internal error'}`);
  }
};

/**
 * Decrypt text when retrieving from the database.
 * @param {string} encryptedText - The encrypted data in hex format.
 * @param {string} iv - The initialization vector in hex format.
 * @param {string} authTag - The authentication tag in hex format.
 * @returns {string} - The decrypted plaintext.
 * @throws {Error} - If decryption fails or if inputs are invalid.
 */
export const decryptMessage = (encryptedText, iv, authTag) => {
  // Validate inputs
  if (!encryptedText || !iv || !authTag) {
    throw new Error('Missing required decryption parameters');
  }
  
  try {
    // Convert hex strings to buffers
    const ivBuffer = Buffer.from(iv, ENCODING);
    const authTagBuffer = Buffer.from(authTag, ENCODING);
    
    // Validate input formats
    if (ivBuffer.length !== IV_LENGTH) {
      throw new Error('Invalid IV length');
    }
    
    if (authTagBuffer.length !== AUTH_TAG_LENGTH) {
      throw new Error('Invalid authentication tag length');
    }
    
    // Create decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      encryptionKeyBuffer,
      ivBuffer
    );
    
    // Set authentication tag
    decipher.setAuthTag(authTagBuffer);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedText, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    // Don't expose detailed error messages in production
    if (error.message.includes('Unsupported state') || 
        error.message.includes('Authentication failed')) {
      throw new Error('Message authentication failed - data may be tampered with');
    }
    
    console.error('Decryption error:', error);
    throw new Error(`Failed to decrypt message: ${process.env.NODE_ENV === 'development' ? error.message : 'Internal error'}`);
  }
};