import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { V3 } = require('paseto');

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