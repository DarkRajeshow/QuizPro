import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const submitQuizResult = async (req: Request, res: Response) => {
    try {
        const { quizId, score, totalQuestions } = req.body;
        const userId = (req as any).user.userId;

        console.log(userId);


        const result = await prisma.result.create({
            data: {
                userId,
                quizId,
                score,
                totalQuestions
            }
        });

        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting quiz result' });
    }
};

export const getUserAttempts = async (req: Request, res: Response) => {
    const { userId } = (req as any).user;

    try {
        const attempts = await prisma.result.findMany({
            where: { userId },
            include: {
                quiz: true,
            },
            orderBy: { completedAt: 'desc' }, // Latest first
        });

        const formattedAttempts = attempts.map((attempt) => ({
            quizId: attempt.quiz.id,
            quizTitle: attempt.quiz.title,
            totalQuestions: attempt.totalQuestions,
            duration: attempt.quiz.duration,
            score: attempt.score,
            pass: attempt.score >= (0.5 * attempt.totalQuestions), // Pass threshold: 50%
            completedAt: attempt.completedAt,
        }));

        res.json(formattedAttempts);
    } catch (error) {
        console.error('Error fetching user attempts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get quiz results
export const getQuizResults = async (req: Request, res: Response) => {
    const { quizId } = req.params;
    const { userId, role } = (req as any).user;

    if (!quizId) {
        return res.status(400).json({ message: 'Quiz ID is required' });
    }

    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                results: {
                    include: {
                        user: true,
                    },
                },
                createdBy: true,
            },
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check if the user is authorized (admin and creator of the quiz)
        if (role !== 'ADMIN' && quiz.createdBy.id !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const results = quiz.results.map((result) => ({
            userId: result.user.id,
            userName: result.user.name,
            score: result.score,
            totalQuestions: result.totalQuestions,
            completedAt: result.completedAt,
        }));

        const averageScore =
            results.reduce((sum, result) => sum + result.score, 0) / results.length || 0;

        const topParticipant =
            results.length > 0
                ? results.reduce((prev, curr) => (curr.score > prev.score ? curr : prev))
                : null;

        res.json({
            quiz: {
                id: quiz.id,
                title: quiz.title,
                duration: quiz.duration,
                description: quiz.description,
                createdAt: quiz.createdAt,
                updatedAt: quiz.updatedAt,
            },
            results,
            averageScore,
            topParticipant,
        });
    } catch (error) {
        console.error('Error fetching quiz results:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getResultById = async (req: Request, res: Response) => {
    try {
        const { resultId } = req.params;

        if (!resultId) {
            return res.status(400).json({ message: 'Result ID is required' });
        }

        const result = await prisma.result.findUnique({
            where: { id: resultId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                quiz: {
                    select: {
                        title: true,
                        description: true,
                    },
                },
            },
        });

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching result:', error);
        res.status(500).json({ message: 'Failed to fetch result' });
    }
};
