// routes/authRoutes.js
import express from 'express';
import { loginUser, registerUser, verifyEmail, sendResetCode, verifyResetCode, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password/send-code', sendResetCode);
router.post('/forgot-password/verify-code', verifyResetCode);
router.post('/forgot-password/reset', resetPassword);
export default router;
