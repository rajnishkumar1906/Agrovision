import { createRequire } from 'module';
import crypto from 'crypto';

const require = createRequire(import.meta.url);
const { V3 } = require('paseto');

export const generatePasetoToken = async (userId) => {
    try {
        const secretKey = process.env.PASETO_SECRET_KEY;
        if (!secretKey) throw new Error('PASETO_SECRET_KEY not configured');
        const expireSeconds = parseInt(process.env.PASETO_EXPIRE || '604800');
        const payload = {
            userId,
            iat: new Date().toISOString(),
            exp: new Date(Date.now() + expireSeconds * 1000).toISOString(),
        };
        const keyBuffer = Buffer.from(secretKey, 'hex');
        const token = await V3.encrypt(payload, keyBuffer);
        return token;
    } catch (error) {
        console.error('Error generating Paseto token:', error);
        throw error;
    }
};

export const verifyPasetoToken = async (token) => {
    try {
        const secretKey = process.env.PASETO_SECRET_KEY;
        if (!secretKey) throw new Error('PASETO_SECRET_KEY not configured');
        const keyBuffer = Buffer.from(secretKey, 'hex');
        const decoded = await V3.decrypt(token, keyBuffer);
        if (decoded.exp && new Date(decoded.exp).getTime() < Date.now()) {
            return { valid: false, error: 'Token has expired' };
        }
        return { valid: true, decoded };
    } catch (error) {
        console.error('PASETO verification error:', error.message);
        return { valid: false, error: error.message };
    }
};

export const generatePasetoSecret = async () => {
    return crypto.randomBytes(32).toString('hex');
};