import express from 'express';
import {
  submitQuizResult,
  getQuizResults,
  getResultById,
  getUserAttempts
} from '../controllers/resultController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticateToken, getUserAttempts);
router.get('/quiz/:quizId', authenticateToken, getQuizResults);
router.get('/:resultId', authenticateToken, getResultById);
router.post('/submit', authenticateToken, submitQuizResult);

export default router;