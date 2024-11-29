import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createQuiz = async (req: Request, res: Response) => {
    try {
        const { title, description, questions, duration } = req.body;
        const creatorId = (req as any).user?.userId;

        if (!creatorId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Validate required fields
        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'Title and at least one question are required' });
        }

        // Validate duration if needed
        if (!duration || typeof duration !== 'number' || duration <= 0) {
            return res.status(400).json({ message: 'Valid duration is required' });
        }

        // Validate question structure
        const invalidQuestion = questions.find((q: any) => {
            return !q.type || !q.text || !Array.isArray(q.options) || q.options.length === 0 || !q.correctAnswer;
        });
        if (invalidQuestion) {
            return res.status(400).json({ message: 'All questions must have type, text, options, and correctAnswer' });
        }

        const quiz = await prisma.quiz.create({
            data: {
                title,
                description,
                duration,
                createdBy: {
                    connect: { id: creatorId }, // Properly connect the `creatorId` to the `User`
                },
                questions: {
                    create: questions.map((q: any) => ({
                        type: q.type,
                        text: q.text,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                    })),
                },
            },
            include: {
                questions: true,
            },
        });

        // Send success response
        res.status(201).json({
            message: 'Quiz created successfully',
            quiz,
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ message: 'Error creating quiz' });
    }
};



export const getAllQuizzes = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const userRole = (req as any).user.role;

        const quizzes = await prisma.quiz.findMany({
            where: userRole === 'ADMIN'
                ? {}
                : { OR: [{ creatorId: userId }, { results: { some: { userId } } }] },
            include: {
                questions: true,
                _count: { select: { questions: true } }
            }
        });

        res.json(quizzes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching quizzes' });
    }
};

// Get most popular quizzes based on results count
export const getPopularQuizzes = async (req: Request, res: Response) => {
    try {
        const quizzes = await prisma.quiz.findMany({
            include: {
                _count: {
                    select: {
                        results: true,
                        questions: true
                    }
                },
            },
            orderBy: { results: { _count: 'desc' } },
            take: 10, // Limit to 10 quizzes
        });

        res.status(200).json(quizzes);
    } catch (error) {
        console.error('Error fetching popular quizzes:', error);
        res.status(500).json({ message: 'Error fetching popular quizzes' });
    }
};


export const getUserQuizzes = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Fetch quizzes created by the logged-in user
        const quizzes = await prisma.quiz.findMany({
            where: { creatorId: userId }, // Filter quizzes by creatorId
            include: {
                questions: true,
                _count: {
                    select: {
                        results: true,
                        questions: true
                    }
                }, // Include a count of questions in each quiz
            },
        });

        res.status(200).json(quizzes);
    } catch (error) {
        console.error('Error fetching user quizzes:', error);
        res.status(500).json({ message: 'Error fetching quizzes' });
    }
};


export const getQuizById = async (req: Request, res: Response) => {
    try {
        const { quizId } = req.params;
        const userId = (req as any).user.userId;
        const userRole = (req as any).user.role;

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: true
            }
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // // Additional authorization check
        // if (userRole !== 'ADMIN' && quiz.creatorId !== userId) {
        //     return res.status(403).json({ message: 'Unauthorized to view this quiz' });
        // }

        res.json(quiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching quiz' });
    }
};
