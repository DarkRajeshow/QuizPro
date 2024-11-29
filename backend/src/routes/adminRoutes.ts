import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getAdminDashboardData } from '../controllers/adminController';

const router = express.Router();

router.get('/', authenticateToken, getAdminDashboardData);

export default router;