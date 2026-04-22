import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js';

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify', authController.verify);

export default router;
