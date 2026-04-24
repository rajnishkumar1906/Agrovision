import paseto from 'paseto';
import * as crypto from 'crypto';

const { V2 } = paseto;

/**
 * Generate a Paseto v2.local token
 * @param {string} userId - The user ID to encode in the token
 * @returns {Promise<string>} - The generated Paseto token
 */
export const generatePasetoToken = async (userId) => {
    try {
        const secretKey = process.env.PASETO_SECRET_KEY;

        if (!secretKey) {
            throw new Error('PASETO_SECRET_KEY not configured in environment variables');
        }

        const expireSeconds = parseInt(process.env.PASETO_EXPIRE || '604800');

        const payload = {
            userId,
            iat: new Date().toISOString(),
            exp: new Date(Date.now() + expireSeconds * 1000).toISOString(),
        };

        // Create key object from hex secret
        const keyBuffer = Buffer.from(secretKey, 'hex');

        // Use the key buffer directly for encryption
        const token = await V2.encrypt(payload, keyBuffer);

        return token;
    } catch (error) {
        console.error('Error generating Paseto token:', error);
        throw error;
    }
};

/**
 * Verify a Paseto v2.local token
 * @param {string} token - The Paseto token to verify
 * @returns {Promise<{valid: boolean, decoded?: object, error?: string}>}
 */
export const verifyPasetoToken = async (token) => {
    try {
        const secretKey = process.env.PASETO_SECRET_KEY;

        if (!secretKey) {
            throw new Error('PASETO_SECRET_KEY not configured in environment variables');
        }

        // Create key object from hex secret
        const keyBuffer = Buffer.from(secretKey, 'hex');

        // Decrypt and verify the token
        const decoded = await V2.decrypt(token, keyBuffer);

        // Check expiration
        if (decoded.exp) {
            const expTime = new Date(decoded.exp).getTime();
            if (expTime < Date.now()) {
                return { valid: false, error: 'Token has expired' };
            }
        }

        return { valid: true, decoded };
    } catch (error) {
        console.error('Error verifying Paseto token:', error);
        return { valid: false, error: error.message };
    }
};

/**
 * Generate Paseto secret key
 * @returns {Promise<string>} - The generated secret key in hex format
 */
export const generatePasetoSecret = async () => {
    try {
        // Generate a random 32-byte key for Paseto v2
        const secretKey = crypto.randomBytes(32);
        return secretKey.toString('hex');
    } catch (error) {
        console.error('Error generating Paseto secret:', error);
        throw error;
    }
};