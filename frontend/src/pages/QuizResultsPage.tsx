import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import Loader from '../components/ui/Loader';

interface Quiz {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

interface QuizResult {
    userId: string;
    userName: string;
    score: number;
    totalQuestions: number;
    completedAt: string;
}

const QuizResultsPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [results, setResults] = useState<QuizResult[]>([]);
    const [averageScore, setAverageScore] = useState<number>(0);
    const [topParticipant, setTopParticipant] = useState<QuizResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await api.getQuizResults(quizId!); // Fetch quiz and results data
                setQuiz(data.quiz);
                setResults(data.results);
                setAverageScore(data.averageScore);
                setTopParticipant(data.topParticipant);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch quiz results:', error);
                setLoading(false);
            }
        };

        fetchResults();
    }, [quizId]);

    if (loading) return <Loader />;

    return (
        <div className="px-20 py-8 flex flex-col gap-2">
            {/* Quiz Info */}
            {quiz && (
                <div className="bg-gray-100 p-8 items-start border-2 border-zinc-400 flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-gray-800">{quiz.title}</h1>
                    <p className="text-gray-600 mb-4">{quiz.description}</p>
                    <p className="text-sm text-gray-500">
                        Created at: {new Date(quiz.createdAt).toLocaleDateString()}
                    </p>
                </div>
            )}

            {/* Top Participant Section */}
            {topParticipant && (
                <div className="bg-green-100 p-8 border-2 border-zinc-400 flex flex-col gap-2">
                    <h2 className="text-xl font-semibold text-green-800">Top Participant</h2>
                    <p className="text-gray-700">
                        <span className="font-bold">{topParticipant.userName}</span> scored{' '}
                        <span className="font-bold">{topParticipant.score / (100 / topParticipant.totalQuestions)}</span> out of{' '}
                        {topParticipant.totalQuestions}.
                    </p>
                </div>
            )}

            {/* Average Score Section */}
            <div className="bg-blue-100 p-8 border-2 border-zinc-400 flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-blue-800">Average Score</h2>
                <p className="text-gray-700">
                    The average score for this quiz is <span className="font-bold">{averageScore.toFixed(2)}</span>.
                </p>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="text-left py-4 px-6">Name</th>
                            <th className="text-left py-4 px-6">Score</th>
                            <th className="text-left py-4 px-6">Total Questions</th>
                            <th className="text-left py-4 px-6">Completed At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((result, index) => (
                            <tr key={index} className="border-t">
                                <td className="py-4 px-6">{result.userName}</td>
                                <td className="py-4 px-6">{result.score}</td>
                                <td className="py-4 px-6">{result.totalQuestions}</td>
                                <td className="py-4 px-6">
                                    {new Date(result.completedAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuizResultsPage;
