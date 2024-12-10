import React, { useEffect, useState } from 'react';
import {
    Trophy,
    Medal,
    BookOpen,
    Clock,
    RefreshCw,
    FileText,
    SearchIcon
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

    useEffect(() => {
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

    const calculateSummary = () => {
        const totalAttempts = attempts.length;
        const averageScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts || 0;
        const passRate = (attempts.filter(attempt => attempt.pass).length / totalAttempts * 100) || 0;

        return { totalAttempts, averageScore, passRate };
    };

    const { totalAttempts, averageScore, passRate } = calculateSummary();

    if (loading) return <Loader />;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white min-h-screen">
            {/* Elegant Header */}
            <div className="bg-white/5 backdrop-blur-md sticky top-0 z-50 border-b-2 border-white">
                <div className="mx-auto px-4 sm:px-6 lg:px-20 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <Trophy className="text-indigo-600" size={32} />
                            <h1 className="text-2xl font-bold text-gray-800">My Learning Journey</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center bg-white border-2 border-zinc-200 rounded-full px-4 py-2">
                                <SearchIcon className="text-gray-500 mr-2" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search attempts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none focus:outline-none w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="mx-auto px-4 sm:px-6 lg:px-20 mt-8">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl shadow-md p-6 transform transition hover:scale-[1.01]">
                        <div className="flex items-center space-x-4">
                            <Medal className="text-yellow-500" size={40} />
                            <div>
                                <p className="text-gray-500">Total Attempts</p>
                                <h2 className="text-3xl font-bold text-indigo-600">{totalAttempts}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 transform transition hover:scale-[1.01]">
                        <div className="flex items-center space-x-4">
                            <BookOpen className="text-green-500" size={40} />
                            <div>
                                <p className="text-gray-500">Average Score</p>
                                <h2 className="text-3xl font-bold text-green-600">{averageScore.toFixed(1)}%</h2>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 transform transition hover:scale-[1.01]">
                        <div className="flex items-center space-x-4">
                            <Trophy className="text-blue-500" size={40} />
                            <div>
                                <p className="text-gray-500">Pass Rate</p>
                                <h2 className="text-3xl font-bold text-blue-600">{passRate.toFixed(1)}%</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attempts Grid */}
            <div className="mx-auto px-4 sm:px-6 lg:px-20 mt-8 pb-12">
                {filteredAttempts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <p className="text-2xl text-gray-500">No attempts found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredAttempts.map((attempt) => (
                            <div
                                key={attempt.id}
                                className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:scale-[1.01] hover:shadow-xl"
                            >
                                <div className={`px-6 py-4 ${attempt.score >= 50 ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-gray-800 truncate pr-4">
                                            {attempt.quizTitle}
                                        </h2>
                                        {attempt.score >= 50 ? (
                                            <Trophy className="text-green-600" size={24} />
                                        ) : (
                                            <RefreshCw className="text-red-600" size={24} />
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="text-indigo-500" size={20} />
                                            <span className="text-gray-600">{attempt.duration} Min</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <FileText className="text-purple-500" size={20} />
                                            <span className="text-gray-600">{attempt.totalQuestions} Questions</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className={`text-center py-2 rounded-lg ${attempt.score >= 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            Score: {attempt.score}%
                                        </div>
                                        <div className={`text-center py-2 rounded-lg ${attempt.score >= 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {attempt.score >= 50 ? 'Passed' : 'Failed'}
                                        </div>
                                    </div>

                                    <div className="text-center text-gray-500 mb-4">
                                        Completed on: {new Date(attempt.completedAt).toLocaleDateString()}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => navigateToQuiz(attempt.quizId)}
                                            className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            Try Again
                                        </button>
                                        <button
                                            onClick={() => navigateToResult(attempt.id)}
                                            className="bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            View Result
                                        </button>
                                    </div>
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