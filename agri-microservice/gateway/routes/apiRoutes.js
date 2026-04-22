import express from 'express';
const router = express.Router();
import * as apiController from '../controllers/apiController.js';
import jwtVerifyMiddleware from '../middleware/jwtMiddleware.js';
import cachingMiddleware from '../middleware/cachingMiddleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

// Auth routes (public - no JWT required)
router.post('/auth/register', apiController.register);
router.post('/auth/login', apiController.login);
router.post('/auth/verify', apiController.verifyToken);

// Protected routes (JWT required)
router.post('/recommend', jwtVerifyMiddleware, cachingMiddleware, apiController.recommendCrop);
router.post('/disease-detect', jwtVerifyMiddleware, upload.single('file'), apiController.detectDisease);  // ← Added upload middleware
router.get('/history', jwtVerifyMiddleware, apiController.getHistory);
router.post('/chatbot/ask-text', jwtVerifyMiddleware, apiController.askChatbot);
router.post('/chatbot/ask-voice', jwtVerifyMiddleware, upload.single('file'), apiController.askChatbotVoice);
router.get('/chatbot/audio/:filename', apiController.proxyChatbotAudio);
router.get('/health', jwtVerifyMiddleware, apiController.healthCheck);

export default router;


