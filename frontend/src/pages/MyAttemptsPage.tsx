import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import Loader from '../components/ui/Loader';
import { useNavigate } from 'react-router-dom';

interface Attempt {
    quizId: string;
    quizTitle: string;
    totalQuestions: number;
    duration: number; // in minutes
    score: number;
    pass: boolean;
    completedAt: string;
}

const MyAttemptsPage: React.FC = () => {
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const navigate = useNavigate()
    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const data = await api.getUserAttempts();
                setAttempts(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch attempts:', error);
                setLoading(false);
            }
        };

        fetchAttempts();
    }, []);

    const navigateToQuiz = (id: string) => {
        navigate(`/quizzes/${id}`);
    }

    if (loading) return <Loader />;

    return (
        <div className="px-20 py-8">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">My Attempts</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attempts.map((attempt) => (
                    <div
                        key={attempt.quizId}
                        className={`p-6 transform transition-all hover:scale-[1.01] cursor-pointer border-2 bg-zinc-50 border-zinc-300`}
                    >
                        {/* Quiz Title */}
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center justify-between">
                                <p className='capitalize'>{attempt.quizTitle}</p>

                                <p className="ml-2">
                                    {attempt.pass ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-green-800">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                        </svg>

                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-red-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                        </svg>
                                    )}
                                </p>
                            </h2>
                        </div>

                        {/* Quiz Information */}
                        <div className="text-gray-700 grid grid-cols-2 gap-2 pt-6">
                            <p className='p-2 bg-zinc-100 text-center'>
                                <strong>Que. </strong> {attempt.totalQuestions}
                            </p>
                            <p className='p-2 bg-zinc-100 text-center'>
                                <strong>Time:</strong> {attempt.duration} Min.
                            </p>
                            <p className='p-2 bg-zinc-100 text-center'>
                                <strong>Score:</strong> {attempt.score}%
                            </p>
                            <p className='p-2 bg-zinc-100 text-center'>
                                <strong>Status:</strong>{' '}
                                <span className={attempt.pass ? 'text-green-700' : 'text-red-700'}>
                                    {attempt.pass ? 'Passed' : 'Failed'}
                                </span>
                            </p>
                            <p className='p-2 col-span-2 bg-zinc-100 text-center'>
                                <strong>Completed At:</strong>{' '}
                                {new Date(attempt.completedAt).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Retry Button */}
                        <button
                            className="mt-4 bg-blue-200 text-black w-full"
                            onClick={navigateToQuiz.bind(this, attempt.quizId)}
                        >
                            Try Again
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyAttemptsPage;
