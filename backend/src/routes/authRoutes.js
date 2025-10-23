// Auth Routes (with input validation)
import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validateRequest.js'; // <-- Add this import

const router = express.Router();

// POST /api/auth/register (validate input before controller)
router.post('/register', validateRegister, register);

// POST /api/auth/login (validate input before controller)
router.post('/login', validateLogin, login);

// GET /api/auth/me (requires JWT)
router.get('/me', authMiddleware, getCurrentUser);

export default router;