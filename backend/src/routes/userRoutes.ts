import express from 'express';
import { createUser, loginUser, getUserProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/profile', authenticateToken, getUserProfile);

export default router;