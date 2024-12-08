import { Request, Response } from 'express';
import { PrismaClient, QuestionType, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export const createQuiz = async (req: Request, res: Response) => {
    try {
        const {
            title,
            description,
            questions,
            duration,
            startDate,
            expiryDate,
            maxAttempts
        } = req.body;
        const creatorId = (req as any).user?.userId;
        const userRole = (req as any).user?.role;

        console.log(req.body);

        // Check if user has permission to create quiz
        if (userRole !== UserRole.QUIZ_MAKER && userRole !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Unauthorized to create quizzes' });
        }

        // Validate required fields
        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'Title and at least one question are required' });
        }

        // Validate duration
        if (!duration || typeof duration !== 'number' || duration <= 0) {
            return res.status(400).json({ message: 'Valid duration is required' });
        }

        // Validate max attempts
        if (!maxAttempts || typeof maxAttempts !== 'number' || maxAttempts <= 0) {
            return res.status(400).json({ message: 'Valid max attempts is required' });
        }

        // Validate date range if provided
        if (startDate && expiryDate && new Date(startDate) >= new Date(expiryDate)) {
            return res.status(400).json({ message: 'Start date must be before expiry date' });
        }

        // Validate question structure based on new QuestionType
        const invalidQuestion = questions.find((q: any) => {
            // Check if question type is valid
            if (!Object.values(QuestionType).includes(q.type)) {
                return true;
            }

            // Validate options based on question type
            switch (q.type) {
                case QuestionType.MULTIPLE_CHOICE:
                case QuestionType.MULTI_ANSWER:
                    // Require options for these types
                    if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
                        return true;
                    }
                    break;
                case QuestionType.TRUE_FALSE:
                case QuestionType.FILL_IN_BLANK:
                    // These types might not require options
                    break;
            }

            // Ensure text and correct answer exist
            // Correct answer should now be an array of strings
            return !q.text ||
                !q.correctAnswer ||
                !Array.isArray(q.correctAnswer) ||
                q.correctAnswer.length === 0;
        });

        if (invalidQuestion) {
            return res.status(400).json({ message: 'Invalid question structure' });
        }

        const quiz = await prisma.quiz.create({
            data: {
                title,
                description,
                duration,
                startDate: startDate ? new Date(startDate) : undefined,
                expiryDate: expiryDate ? new Date(expiryDate) : undefined,
                maxAttempts,
                createdBy: {
                    connect: { id: creatorId },
                },
                questions: {
                    create: questions.map((q: any) => ({
                        type: q.type,
                        text: q.text,
                        options: q.options ? q.options : undefined, // Pass the array directly
                        correctAnswer: q.correctAnswer, // Now directly an array of strings
                    })),
                },
            },
            include: {
                questions: true,
            },
        });


        res.status(201).json({
            message: 'Quiz created successfully',
            quiz,
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ message: 'Error creating quiz' });
    }
};

export const getQuizById = async (req: Request, res: Response) => {
    try {
        const { quizId } = req.params;
        const userId = (req as any).user.userId;
        const userRole = (req as any).user.role;
        const now = new Date();

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: true,
                attempts: {
                    where: { userId },
                    select: { id: true, completedAt: true, score: true }
                }
            }
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check quiz availability and user permissions
        const isAvailable = (!quiz.startDate || quiz.startDate <= now) &&
            (!quiz.expiryDate || quiz.expiryDate >= now);
        const isCreator = quiz.creatorId === userId;
        const isAdmin = userRole === UserRole.ADMIN;

        // Check if user has exceeded max attempts
        const userAttempts = await prisma.attempt.count({
            where: {
                quizId,
                userId
            }
        });
        const canAttempt = userAttempts < quiz.maxAttempts;

        // Process questions if needed
        // const processedQuestions = quiz.questions.map(q => {
        //     const processedQuestion = {
        //         ...q,
        //         options: q.options ? JSON.parse(q.options as string) : null
        //     };

        //     // Remove correct answers for non-creators/admins
        //     if (!isCreator && !isAdmin) {
        //         delete processedQuestion.correctAnswer;
        //     }
        //     return processedQuestion;
        // });

        res.json({
            ...quiz,
            // questions: processedQuestions,
            userAttempts, // Include userAttempts in the response
            isAvailable,
            canAttempt,
            remainingAttempts: Math.max(0, quiz.maxAttempts - userAttempts)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching quiz' });
    }
};

// Other methods remain the same as in the previous version
export const getAllQuizzes = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const userRole = (req as any).user.role;
        const now = new Date();

        const quizzes = await prisma.quiz.findMany({
            where: {
                ...(userRole !== UserRole.ADMIN
                    ? {
                        OR: [
                            { creatorId: userId }, // Quizzes created by user
                            {
                                // Public quizzes within date range
                                startDate: { lte: now },
                                expiryDate: { gte: now }
                            }
                        ]
                    }
                    : {}
                )
            },
            include: {
                questions: {
                    select: {
                        id: true,
                        type: true,
                        text: true
                    }
                },
                _count: { select: { questions: true, attempts: true } }, // Count questions and total attempts
                attempts: {
                    where: { userId: userId }, // Filter attempts by the logged-in user
                    select: { id: true } // Select only the ID to count
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform quizzes to include availability status and user-specific attempts
        const transformedQuizzes = quizzes.map(quiz => ({
            ...quiz,
            isAvailable: (!quiz.startDate || quiz.startDate <= now) &&
                (!quiz.expiryDate || quiz.expiryDate >= now),
            userAttempts: quiz.attempts.length // Count of attempts made by the logged-in user
        }));

        res.json(transformedQuizzes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching quizzes' });
    }
};

// Remaining methods (getUserQuizzes, getPopularQuizzes) stay the same
export const getUserQuizzes = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const userRole = (req as any).user?.role;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const now = new Date();
        const quizzes = await prisma.quiz.findMany({
            where: {
                ...(userRole === UserRole.ADMIN
                    ? {}
                    : { creatorId: userId }
                )
            },
            include: {
                questions: {
                    select: {
                        id: true,
                        type: true,
                        text: true
                    }
                },
                _count: {
                    select: {
                        attempts: true,
                        questions: true
                    }
                },
                attempts: {
                    where: { userId: userId }, // Filter attempts by the logged-in user
                    select: { id: true } // Select only the ID to count
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform quizzes to include availability status, user-specific attempts, and total attempts
        const transformedQuizzes = quizzes.map(quiz => ({
            ...quiz,
            isAvailable: (!quiz.startDate || quiz.startDate <= now) &&
                (!quiz.expiryDate || quiz.expiryDate >= now),
            userAttempts: quiz.attempts.length, // Count of attempts made by the logged-in user
            totalAttempts: quiz._count.attempts // Total attempts by all users
        }));

        res.status(200).json(transformedQuizzes);
    } catch (error) {
        console.error('Error fetching user quizzes:', error);
        res.status(500).json({ message: 'Error fetching quizzes' });
    }
};

export const getPopularQuizzes = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const userId = (req as any).user?.userId;

        const quizzes = await prisma.quiz.findMany({
            include: {
                questions: {
                    select: {
                        id: true,
                        type: true,
                        text: true
                    }
                },
                _count: {
                    select: {
                        attempts: true,
                        questions: true
                    }
                },
                attempts: {
                    where: { userId: userId }, // Filter attempts by the logged-in user
                    select: { id: true } // Select only the ID to count
                }
            },
            orderBy: {
                attempts: {
                    _count: 'desc'
                }
            },
            take: 10,
        });

        // Transform quizzes to include availability status, user-specific attempts, and total attempts
        const transformedQuizzes = quizzes.map(quiz => ({
            ...quiz,
            isAvailable: (!quiz.startDate || quiz.startDate <= now) &&
                (!quiz.expiryDate || quiz.expiryDate >= now),
            userAttempts: quiz.attempts.length, // Count of attempts made by the logged-in user
            totalAttempts: quiz._count.attempts // Total attempts by all users
        }));

        res.status(200).json(transformedQuizzes);
    } catch (error) {
        console.error('Error fetching popular quizzes:', error);
        res.status(500).json({ message: 'Error fetching popular quizzes' });
    }
};