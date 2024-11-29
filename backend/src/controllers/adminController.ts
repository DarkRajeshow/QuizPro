import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

// Helper function to handle BigInt serialization
const safeJson = (data: any) => JSON.parse(JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value)));

export const getAdminDashboardData = async (req: Request, res: Response) => {
    try {
        // Total Users
        const totalUsers = await prisma.user.count();

        // Total Quizzes
        const totalQuizzes = await prisma.quiz.count();

        // Total Questions
        const totalQuestions = await prisma.question.count();

        // Average Quiz Score
        const averageQuizScoreResult = await prisma.result.aggregate({
            _avg: { score: true },
        });
        const averageQuizScore = averageQuizScoreResult._avg.score || 0;

        // Top Quizzes by Average Score
        const topQuizzesData = await prisma.result.groupBy({
            by: ['quizId'],
            _avg: { score: true },
            _count: { quizId: true },
            orderBy: { _avg: { score: 'desc' } },
            take: 5,
        });

        const topQuizzes = await Promise.all(
            topQuizzesData.map(async (quiz) => {
                const quizDetails = await prisma.quiz.findUnique({
                    where: { id: quiz.quizId },
                    select: { title: true, createdAt: true },
                });
                return {
                    name: quizDetails?.title || 'Unknown Quiz',
                    averageScore: quiz._avg.score || 0,
                    totalAttempts: quiz._count.quizId,
                    createdDate: quizDetails?.createdAt.toISOString() || '',
                };
            })
        );

        // Weekly Signups
        const weeklySignups = await prisma.$queryRaw<
            { week: Date; signups: BigInt }[]
        >`
            SELECT 
                date_trunc('week', "createdAt") AS week,
                COUNT(*) AS signups
            FROM "User"
            GROUP BY week
            ORDER BY week
        `;

        // Weekly Quiz Completions
        const weeklyQuizCompletions = await prisma.$queryRaw<
            { week: Date; quizCompletions: BigInt }[]
        >`
            SELECT 
                date_trunc('week', "completedAt") AS week,
                COUNT(*) AS quizCompletions
            FROM "Result"
            GROUP BY week
            ORDER BY week
        `;

        // Merge Weekly Activity Data
        const userActivityData = weeklySignups.map((signup) => {
            const completions = weeklyQuizCompletions.find(
                (completion) => completion.week.getTime() === signup.week.getTime()
            );
            return {
                week: signup.week,
                signups: Number(signup.signups), // Convert BigInt to Number
                quizCompletions: completions ? Number(completions.quizCompletions) : 0,
            };
        });

        // Question Type Distribution
        const questionTypeDistributionData = await prisma.question.groupBy({
            by: ['type'],
            _count: { type: true },
        });

        const questionTypeDistribution = questionTypeDistributionData.map((group) => ({
            type: group.type,
            count: group._count.type,
        }));

        // Recent Activities
        const recentActivitiesData = await prisma.result.findMany({
            take: 10,
            orderBy: { completedAt: 'desc' },
            include: {
                user: { select: { name: true } },
                quiz: { select: { title: true } },
            },
        });

        const recentActivities = recentActivitiesData.map((activity) => ({
            userName: activity.user?.name || 'Unknown User',
            quizTitle: activity.quiz?.title || 'Unknown Quiz',
            score: activity.score,
            dateOfAttempt: activity.completedAt?.toISOString() || '',
        }));

        // Return Dashboard Data
        res.json(
            safeJson({
                totalUsers,
                totalQuizzes,
                totalQuestions,
                averageQuizScore: averageQuizScore, // Percentage format
                topQuizzes,
                userActivityData,
                questionTypeDistribution,
                recentActivities,
            })
        );
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch admin dashboard data' });
    }
};

