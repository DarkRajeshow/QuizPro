import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const submitQuizAttempt = async (req: Request, res: Response) => {
    try {
        const { quizId, score, totalQuestions } = req.body;
        const userId = (req as any).user.userId;

        // Check quiz availability and attempt limits
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            select: {
                startDate: true,
                expiryDate: true,
                maxAttempts: true
            }
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const currentDate = new Date();
        if (quiz.startDate && currentDate < quiz.startDate) {
            return res.status(400).json({ message: 'Quiz is not yet available' });
        }

        if (quiz.expiryDate && currentDate > quiz.expiryDate) {
            return res.status(400).json({ message: 'Quiz has expired' });
        }

        // Check number of existing attempts
        const existingAttemptsCount = await prisma.attempt.count({
            where: {
                userId,
                quizId,
            }
        });

        if (quiz.maxAttempts && existingAttemptsCount >= quiz.maxAttempts) {
            return res.status(400).json({
                message: `Maximum attempts (${quiz.maxAttempts}) reached for this quiz`
            });
        }

        const attempt = await prisma.attempt.create({
            data: {
                userId,
                quizId,
                score,
                totalQuestions,
                completedAt: currentDate
            }
        });

        res.status(201).json(attempt);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting quiz attempt' });
    }
};

export const getUserAttempts = async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { quizId } = req.query;

    try {
        const whereClause = quizId
            ? { userId, quizId: String(quizId) }
            : { userId };

        const attempts = await prisma.attempt.findMany({
            where: whereClause,
            include: {
                quiz: {
                    select: {
                        title: true,
                        maxAttempts: true,
                        startDate: true,
                        expiryDate: true,
                        duration: true
                    }
                },
            },
            orderBy: { completedAt: 'desc' },
        });

        const formattedAttempts = attempts.map((attempt: any) => ({
            id: attempt.id,
            quizId: attempt.quizId,
            quizTitle: attempt.quiz.title,
            duration: attempt.quiz.duration,
            totalQuestions: attempt.totalQuestions,
            score: attempt.score,
            pass: attempt.score >= (0.5 * attempt.totalQuestions), // Pass threshold: 50%
            completedAt: attempt.completedAt,
            remainingAttempts: attempt.quiz.maxAttempts
                ? attempt.quiz.maxAttempts - (attempts.filter(a => a.quizId === attempt.quizId).length)
                : null,
            quizAvailability: {
                startDate: attempt.quiz.startDate,
                expiryDate: attempt.quiz.expiryDate
            }
        }));

        res.json(formattedAttempts);
    } catch (error) {
        console.error('Error fetching user attempts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getQuizAttempts = async (req: Request, res: Response) => {
    const { quizId } = req.params;
    const { userId, role } = (req as any).user;

    if (!quizId) {
        return res.status(400).json({ message: 'Quiz ID is required' });
    }

    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                attempts: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
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

        const attempts = quiz.attempts.map((attempt) => ({
            userId: attempt.user.id,
            userName: attempt.user.name,
            userEmail: attempt.user.email,
            score: attempt.score,
            totalQuestions: attempt.totalQuestions,
            completedAt: attempt.completedAt,
        }));

        const averageScore =
            attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length || 0;

        const topParticipant =
            attempts.length > 0
                ? attempts.reduce((prev, curr) => (curr.score > prev.score ? curr : prev))
                : null;

        res.json({
            quiz: {
                id: quiz.id,
                title: quiz.title,
                description: quiz.description,
                startDate: quiz.startDate,
                expiryDate: quiz.expiryDate,
                maxAttempts: quiz.maxAttempts,
                createdAt: quiz.createdAt,
                updatedAt: quiz.updatedAt,
            },
            attempts,
            averageScore,
            topParticipant,
        });
    } catch (error) {
        console.error('Error fetching quiz attempts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAttemptById = async (req: Request, res: Response) => {
    try {
        const { attemptId } = req.params;
        const { userId, role } = (req as any).user;

        if (!attemptId) {
            return res.status(400).json({ message: 'Attempt ID is required' });
        }

        const attempt = await prisma.attempt.findUnique({
            where: { id: attemptId },
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
                        id: true,
                        title: true,
                        description: true,
                        createdBy: true,
                    },
                },
            },
        });

        if (!attempt) {
            return res.status(404).json({ message: 'Attempt not found' });
        }

        // Access control: Only admin, quiz creator, or the user who made the attempt can view
        if (role !== 'ADMIN' &&
            attempt.user.id !== userId &&
            attempt.quiz.createdBy.id !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.status(200).json(attempt);
    } catch (error) {
        console.error('Error fetching attempt:', error);
        res.status(500).json({ message: 'Failed to fetch attempt' });
    }
};