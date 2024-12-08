import React, { useEffect, useState } from 'react';
import {
    CheckCircle2,
    XCircle,
    Clock,
    BarChart2,
    Search,
    Star
} from 'lucide-react';
import { api } from '../utils/api';
import Loader from '../components/ui/Loader';
import { useNavigate } from 'react-router-dom';

interface Attempt {
    id: string,
    quizId: string;
    quizTitle: string;
    totalQuestions: number;
    duration: number;
    score: number;
    pass: boolean;
    completedAt: string;
}

const MyAttemptsPage: React.FC = () => {
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filteredAttempts, setFilteredAttempts] = useState<Attempt[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const data = await api.getUserAttempts();
                setAttempts(data);
                setFilteredAttempts(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch attempts:', error);
                setLoading(false);
            }
        };

        fetchAttempts();
    }, []);

    // Search and filter functionality
    useEffect(() => {
        console.log(searchTerm);
        
        const filtered = attempts.filter(attempt =>
            attempt.quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredAttempts(filtered);
    }, [searchTerm, attempts]);

    const navigateToQuiz = (id: string) => {
        navigate(`/take-quiz/${id}`);
    }
    const navigateToResult = (attemptId: string) => {
        navigate(`/results/${attemptId}`);
    }

    // Calculate summary statistics
    const calculateSummary = () => {
        const totalAttempts = attempts.length;
        const averageScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts || 0;
        const passRate = (attempts.filter(attempt => attempt.pass).length / totalAttempts * 100) || 0;

        return { totalAttempts, averageScore, passRate };
    };
3
    const { totalAttempts, averageScore, passRate } = calculateSummary();

    if (loading) return <Loader />;

    return (
        <div className="bg-zinc-100 min-h-screen p-8">
            <div className="mx-auto w-[94%]">
                {/* Header and Statistics Section */}
                <div className="mb-8 bg-white shadow-sm p-6 rounded-lg">
                    <div className="flex justify-between items-center">
                        <h1 className="text-4xl font-bold text-gray-800 flex items-center">
                            <BarChart2 className="mr-4 text-purple-600" size={40} />
                            My Quiz Attempts
                        </h1>
                        <div className="text-right">
                            <p className="text-xl text-gray-600">
                                <strong className="text-purple-700">{totalAttempts}</strong> Total Attempts
                            </p>
                            <p className="text-lg text-gray-500">
                                Avg. Score: <strong className="text-green-600">{averageScore.toFixed(1)}%</strong>
                            </p>
                            <p className="text-lg text-gray-500">
                                Pass Rate: <strong className="text-blue-600">{passRate.toFixed(1)}%</strong>
                            </p>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="mt-6 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search attempts by quiz title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 transition-all"
                        />
                    </div>
                </div>

                {/* Attempts Grid */}
                {filteredAttempts.length === 0 ? (
                    <div className="text-center bg-white flex items-center justify-center h-[60vh] p-12">
                        <p className="text-2xl text-gray-500">No attempts found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAttempts.map((attempt) => (
                            <div
                                key={attempt.id}
                                className="bg-white shadow-lg overflow-hidden transform transition-all hover:scale-[1.01] cursor-pointer py-5 rounded-lg"
                            >
                                {/* Quiz Header */}
                                <div className={`px-10 py-4 ${attempt.score >= 50 ? 'bg-green-50/60' : 'bg-red-50/60'}`}>
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold capitalize text-gray-800">
                                            {attempt.quizTitle}
                                        </h2>
                                        {attempt.score >= 50 ? (
                                            <CheckCircle2 className="text-green-600" size={24} />
                                        ) : (
                                            <XCircle className="text-red-600" size={24} />
                                        )}
                                    </div>
                                </div>

                                {/* Quiz Details */}
                                <div className="py-6 px-10">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="text-blue-500" size={20} />
                                            <span>{attempt.duration} Min</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Star className="text-yellow-500" size={20} />
                                            <span>{attempt.totalQuestions} Questions</span>
                                        </div>
                                        <div className={`text-center p-2 rounded ${attempt.score >= 50 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                            Score: {attempt.score}%
                                        </div>
                                        <div className={`text-center p-2 rounded ${attempt.score >= 50 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                            {attempt.score >= 50 ? 'Passed' : 'Failed'}
                                        </div>
                                    </div>

                                    <div className="mt-4 text-center text-gray-500">
                                        Completed on: {new Date(attempt.completedAt).toLocaleDateString()}
                                    </div>

                                    {/* Retry Button */}
                                    <button
                                        onClick={() => navigateToQuiz(attempt.quizId)}
                                        className="mt-6 w-full bg-purple-600 text-white py-2 hover:bg-purple-700 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={() => navigateToResult(attempt.id)}
                                        className="mt-2 w-full bg-zinc-200 text-black py-2 hover:bg-zinc-200/60 transition-colors"
                                    >
                                        View Full Result
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAttemptsPage;