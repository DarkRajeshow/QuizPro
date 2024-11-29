import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';

interface Result {
    id: string;
    score: number;
    totalQuestions: number;
    completedAt: string;
    quiz: {
        title: string;
        description: string;
    };
    user: {
        name: string;
        email: string;
    };
}

const ResultPage: React.FC = () => {
    const { resultId } = useParams<{ resultId: string }>(); // Fetch the result ID from URL params
    const [result, setResult] = useState<Result | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const naviagete = useNavigate()
    const navigateToQuizzes = () => {
        naviagete("/quizzes")
    }

    useEffect(() => {
        const fetchResult = async () => {
            try {
                setLoading(true);
                if (!resultId) throw new Error('Result ID is missing');
                const data = await api.getResultById(resultId); // Fetch the result using the API function

                setResult(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch result');
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [resultId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg font-semibold text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg font-semibold text-red-600">{error}</div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg font-semibold text-gray-600">No result found</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center p-6">
            <div className="h-[80vh] w-[70vw] bg-zinc-50 shadow-lg rounded-lg p-6 flex flex-col justify-between">
                <div>
                    <h1 className={`font-extrabold border-b-4 pb-6 border-black/10 text-center mb-10 text-3xl ${result.score > 70
                        ? 'text-green-600'
                        : result.score > 50
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                        {result.score > 50 ? "You Passed" : "You Failed"}

                    </h1>
                    <div className='flex items-center justify-between py-2'>
                        <h1 className="text-3xl font-bold text-gray-800 capitalize">{result.quiz.title}</h1>
                        <span
                            className={`font-bold text-3xl ${result.score > 70
                                ? 'text-green-600'
                                : result.score > 50
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`}
                        >
                            {result.score.toFixed(2)}%
                        </span>
                    </div>
                    <p className="text-gray-600 mb-6 capitalize">{result.quiz.description}</p>

                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">User Information</h2>
                        <p className="text-lg text-gray-600">
                            <strong>Name:</strong> {result.user.name}
                        </p>
                        <p className="text-lg text-gray-600">
                            <strong>Email:</strong> {result.user.email}
                        </p>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">Result Details</h2>
                        <p className="text-lg text-gray-600">
                            <strong>Score:</strong> {(result.score / (100 / result.totalQuestions)).toFixed(0)} / {result.totalQuestions}
                        </p>
                        <p className="text-lg text-gray-600">
                            <strong>Completed At:</strong> {new Date(result.completedAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                <button
                    onClick={navigateToQuizzes}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                >
                    Go to Quizes
                </button>
            </div>
        </div>
    );
};

export default ResultPage;
