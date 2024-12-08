import express from 'express';
import {
  getAttemptById,
  getQuizAttempts,
  getUserAttempts,
  submitQuizAttempt
} from '../controllers/resultController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticateToken, getUserAttempts);
router.get('/quiz/:quizId', authenticateToken, getQuizAttempts);
router.get('/:attemptId', authenticateToken, getAttemptById);
router.post('/submit', authenticateToken, submitQuizAttempt);

export default router;