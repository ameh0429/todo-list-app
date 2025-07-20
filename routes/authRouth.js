import express from 'express';
import { register, login, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.put('/profile', protect, updateProfile);

export default router;

