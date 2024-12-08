import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { api } from '../utils/api';
// import Confetti from 'react-confetti';
// import { motion } from 'framer-motion';

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
    const { quizId } = useParams();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [results, setResults] = useState<QuizResult[]>([]);
    const [filteredResults, setFilteredResults] = useState<QuizResult[]>([]);
    const [averageScore, setAverageScore] = useState<number>(0);
    const [topParticipant, setTopParticipant] = useState<QuizResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'score', direction: 'desc' });
    // const [showConfetti, setShowConfetti] = useState<boolean>(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!quizId) {
                return;
            }
            try {
                const data = await api.getQuizResults(quizId);
                setQuiz(data.quiz);
                setResults(data.attempts);
                setFilteredResults(data.attempts);
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

    // Sorting and Filtering Logic
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        const filtered = results.filter(result =>
            result.userName.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredResults(filtered);
    };

    const handleSort = (key: string) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
        setSortConfig({ key, direction });

        const sortedResults = [...filteredResults].sort((a, b) => {
            if (a[key as keyof QuizResult] < b[key as keyof QuizResult]) return direction === 'asc' ? -1 : 1;
            if (a[key as keyof QuizResult] > b[key as keyof QuizResult]) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredResults(sortedResults);
    };

    // Score Distribution Data for Chart
    const scoreDistributionData = results.map(result => ({
        name: result.userName,
        score: result.score
    }));

    if (loading) return <div className="text-center text-xl py-10">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Confetti Effect (Simulated) */}


            {/* Quiz Header */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg shadow-sm p-6 capitalize">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                    {quiz?.title}
                </h1>
                <p className="text-gray-700 mb-2">{quiz?.description}</p>
                <div className="text-sm text-gray-500">
                    Created on: {quiz ? new Date(quiz.createdAt).toLocaleDateString() : ''}
                </div>
            </div>

            {/* <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{
                    duration: 5,
                    delay: 8,
                }}
            >
                {showConfetti && <Confetti className="absolute top-0 p-0 m-0" />}
            </motion.div> */}
            {/* Top Participant & Average Score */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Top Participant Card */}
                <div className="bg-green-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-green-800 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Top Participant
                        </h2>
                        <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs">
                            Champion
                        </span>
                    </div>
                    {topParticipant && <>
                        <div className="text-2xl font-bold text-green-800 flex items-center gap-2">
                            {topParticipant?.userName}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 fill-current" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1 .175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                        <p className="text-gray-600">
                            Score: {topParticipant?.score / (100 / topParticipant?.totalQuestions)}/{topParticipant.totalQuestions}
                        </p>
                    </>}
                </div>

                {/* Average Score Card */}
                <div className="bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
                    <h2 className="text-xl font-semibold text-blue-800 mb-4">Average Performance</h2>
                    <div className="w-full bg-blue-200 rounded-full h-4 mb-2">
                        <div
                            className="bg-blue-600 h-4 rounded-full"
                            style={{ width: `${averageScore}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">0</span>
                        <span className="font-bold text-blue-600">
                            {averageScore.toFixed(1)}%
                        </span>
                        <span className="text-sm text-gray-600">100</span>
                    </div>
                </div>
            </div>

            {/* Score Distribution Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Score Distribution</h2>
                <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreDistributionData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="score" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Participant Results</h2>
                    <input
                        type="text"
                        placeholder="Search participants"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                {['Name', 'Score', 'Total Questions', 'Completed At'].map((header) => (
                                    <th
                                        key={header}
                                        onClick={() => handleSort(header.toLowerCase().replace(' ', ''))}
                                        className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 transition-colors"
                                    >
                                        {header}
                                        <span className="ml-2 text-gray-500">↕</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResults.map((result, index) => (
                                <tr
                                    key={index}
                                    className="border-b hover:bg-blue-50 transition-colors"
                                >
                                    <td className="px-4 py-3">{result.userName}</td>
                                    <td className="px-4 py-3">{result.score}</td>
                                    <td className="px-4 py-3">{result.totalQuestions}</td>
                                    <td className="px-4 py-3">
                                        {new Date(result.completedAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default QuizResultsPage;