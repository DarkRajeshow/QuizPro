import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Quiz, Result } from '../utils/types';

const UserPage: React.FC = () => {
    const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
    const [userResults, setUserResults] = useState<Result[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [quizzes, results] = await Promise.all([
                    api.getQuizzes(),
                    api.getUserResults()
                ]);

                setAvailableQuizzes(quizzes);
                setUserResults(results);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch data', error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">User Dashboard</h1>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Available Quizzes Section */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Available Quizzes</h2>
                    {isLoading ? (
                        <div className="text-center text-gray-600">Loading quizzes...</div>
                    ) : availableQuizzes.length === 0 ? (
                        <div className="text-center text-gray-600">
                            No quizzes available at the moment
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {availableQuizzes.map((quiz) => (
                                <div
                                    key={quiz.id}
                                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300 flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="text-lg font-medium">{quiz.title}</h3>
                                        <p className="text-gray-600 text-sm">
                                            {quiz.questions.length} Questions
                                        </p>
                                    </div>
                                    <Link
                                        to={`/quiz/${quiz.id}`}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition duration-300"
                                    >
                                        Start Quiz
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* User Results Section */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Your Results</h2>
                    {isLoading ? (
                        <div className="text-center text-gray-600">Loading results...</div>
                    ) : userResults.length === 0 ? (
                        <div className="text-center text-gray-600">
                            No quiz results yet
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {userResults.map((result) => (
                                <div
                                    key={result.id}
                                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">Quiz Score</span>
                                        <span
                                            className={`font-bold ${result.score >= 70 ? 'text-green-600' : 'text-red-600'
                                                }`}
                                        >
                                            {result.score.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Completed on: {new Date(result.completedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserPage;