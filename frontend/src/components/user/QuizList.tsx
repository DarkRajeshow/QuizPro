import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { Quiz } from '../../utils/types';

interface QuizListProps {
    isAdminView?: boolean;
}

const QuizList: React.FC<QuizListProps> = ({ isAdminView = false }) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const fetchedQuizzes = await api.getQuizzes();
                setQuizzes(fetchedQuizzes);
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to fetch quizzes', err);
                setError('Unable to load quizzes. Please try again later.');
                setIsLoading(false);
            }
        };

        fetchQuizzes();
    }, []);

    const handleQuizAction = (quiz: Quiz) => {
        if (isAdminView) {
            // For admin, navigate to quiz edit or details page
            navigate(`/admin/quiz/${quiz.id}`);
        } else {
            // For users, navigate to quiz attempt page
            navigate(`/quiz/${quiz.id}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    {isAdminView ? 'Manage Quizzes' : 'Available Quizzes'}
                </h1>
                {isAdminView && (
                    <Link
                        to="/admin/create-quiz"
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                    >
                        Create New Quiz
                    </Link>
                )}
            </div>

            {quizzes.length === 0 ? (
                <div className="text-center text-gray-600">
                    {isAdminView
                        ? 'No quizzes created yet. Start by creating a new quiz!'
                        : 'No quizzes available at the moment.'}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {quizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 flex flex-col"
                        >
                            <div className="flex-grow">
                                <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
                                <p className="text-gray-600 mb-4 text-sm">
                                    {quiz.description || 'No description provided'}
                                </p>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    {quiz.questions.length} Questions
                                </div>
                                <button
                                    onClick={() => handleQuizAction(quiz)}
                                    className={`
                    ${isAdminView
                                            ? 'bg-yellow-500 hover:bg-yellow-600'
                                            : 'bg-blue-500 hover:bg-blue-600'
                                        } 
                    text-white px-3 py-1 rounded transition duration-300
                  `}
                                >
                                    {isAdminView ? 'Manage' : 'Take Quiz'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizList;