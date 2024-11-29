import React, { useContext, useEffect, useState } from 'react';
import QuizCard from '../components/reusable/QuizCard';
import { api } from '../utils/api';
import { AuthContext } from '../App';

interface Quiz {
    id: string;
    title: string;
    description: string | null;
    _count: {
        results: number,
        questions: number
    };
    createdAt: string;
}

const QuizzesPage: React.FC = () => {
    const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([]);
    const [popularQuizzes, setPopularQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext)
    useEffect(() => {

        const fetchData = async () => {
            try {
                const userQuizzesTemp = await api.getUserQuizzes();
                const popularQuizzesTemp = await api.getPopularQuizzes();

                setUserQuizzes(userQuizzesTemp);
                setPopularQuizzes(popularQuizzesTemp);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch data', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="px-20 py-8 from-blue-100 to-blue-300 ">
            {loading && <div className='h-6 w-6 rounded-full border-2 border-b-none animate-spin' />}
            {/* User Quizzes Section */}
            <section>
                <h2 className="text-3xl font-semibold mb-4 text-gray-800">Your Quizzes</h2>
                {userQuizzes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userQuizzes.map((quiz) => (
                            <QuizCard
                                key={quiz.id}
                                id={quiz.id}
                                isUserQuize={true}
                                title={quiz.title}
                                description={quiz.description}
                                totalAttempts={quiz._count.results}
                                totalQuestions={quiz._count.questions}
                                createdAt={quiz.createdAt}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">You haven’t created any quizzes yet.</p>
                )}
            </section>

            {/* Popular Quizzes Section */}
            <section className="mt-10">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Popular Quizzes</h2>
                {popularQuizzes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {popularQuizzes.map((quiz) => (
                            <QuizCard
                                key={quiz.id}
                                id={quiz.id}
                                isUserQuize={user.role === "ADMIN"}
                                title={quiz.title}
                                description={quiz.description}
                                totalAttempts={quiz._count.results}
                                totalQuestions={quiz._count.results}
                                createdAt={quiz.createdAt}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No popular quizzes available.</p>
                )}
            </section>
        </div>
    );
};

export default QuizzesPage;
