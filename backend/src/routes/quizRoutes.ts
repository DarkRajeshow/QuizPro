import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { createQuiz, getAllQuizzes, getPopularQuizzes, getQuizById, getUserQuizzes, updateQuizById } from '../controllers/quizController';

const router = express.Router();

router.post('/', authenticateToken, createQuiz);
router.put('/:quizId', authenticateToken, updateQuizById);


//get
//for admin
router.get('/', authenticateToken, getAllQuizzes);



//for user
router.get('/user', authenticateToken, getUserQuizzes);
router.get('/popular', authenticateToken, getPopularQuizzes);
router.get('/:quizId', authenticateToken, getQuizById);

export default router;
