import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
    ShareIcon,
    ClipboardCopyIcon,
    RefreshCwIcon,
    ListIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../utils/api';
import Confetti from 'react-confetti';


// Placeholder for Gravatar import if needed
// import Gravatar from 'react-gravatar';

// Interfaces (move these to a separate file in a real project)
interface Result {
    id: string;
    score: number;
    totalQuestions: number;
    completedAt: string;
    quiz: {
        id: string,
        title: string;
        description: string;
    };
    user: {
        name: string;
        email: string;
    };
}

// Utility functions
const getPerformanceMessage = (score: number) => {
    if (score > 80) return "Excellent Work! 🏆";
    if (score > 60) return "Great Job! 👏";
    if (score > 40) return "Good Effort! 👍";
    return "Keep Practicing! 💪";
};

const getResultColor = (score: number) => {
    if (score > 80) return "bg-green-500";
    if (score > 60) return "bg-blue-500";
    if (score > 40) return "bg-yellow-500";
    return "bg-red-500";
};

const getTestColor = (score: number) => {
    if (score > 80) return "text-green-500";
    if (score > 60) return "text-blue-500";
    if (score > 40) return "text-yellow-500";
    return "text-red-500";
};

const ResultPage: React.FC = () => {
    const { resultId } = useParams<{ resultId: string }>();
    const [result, setResult] = useState<Result | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const navigate = useNavigate();
    const [showConfetti, setShowConfetti] = useState<boolean>(false);

    // Memoized calculations
    const resultData = useMemo(() => {
        if (!result) return [];
        return [
            { name: 'Correct', value: result.score / 100 * result.totalQuestions },
            { name: 'Incorrect', value: result.totalQuestions - (result.score / 100 * result.totalQuestions) }
        ];
    }, [result]);

    const COLORS = ['#00C49F', '#FF6384'];

    useEffect(() => {
        const fetchResult = async () => {
            try {
                setLoading(true);
                if (!resultId) throw new Error('Result ID is missing');

                // Simulated API call - replace with actual API
                const data = await api.getResultById(resultId);

                setResult(data);
                if (data.score >= 50) {
                    setShowConfetti(true)
                }


            } catch (err: any) {
                setError(err.message || 'Failed to fetch result');
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [resultId]);

    const handleCopy = () => {
        setIsCopied(true);
        toast.success('Email copied to clipboard!');
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleShareResult = () => {
        // Implement result sharing logic
        toast.info('Result sharing coming soon!');
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-100 to-purple-100"
            >
                <div className="animate-pulse text-2xl font-semibold text-gray-600">
                    Loading Result...
                </div>
            </motion.div>
        );
    }

    if (error || !result) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-red-100 to-pink-100"
            >
                <div className="text-3xl font-bold text-red-600 mb-4">
                    Oops! Something Went Wrong
                </div>
                <p className="text-xl text-gray-700 mb-6">
                    {error || 'No result found'}
                </p>
                <button
                    onClick={() => navigate('/quizzes')}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                    Back to Quizzes
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen  flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{
                    duration: 5,
                    delay: 8,
                }}
            >
                {showConfetti && <Confetti className="absolute top-0 p-0 m-0" />}
            </motion.div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                }}
                className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Result Header */}
                <div className={`p-6 text-center text-white ${getResultColor(result.score)}`}>
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-4xl font-bold mb-2">
                            {result.score > 50 ? "Congratulations! 🎉" : "Keep Trying! 💪"}
                        </h1>
                        <p className="text-xl">
                            {getPerformanceMessage(result.score)}
                        </p>
                    </motion.div>
                </div>

                {/* Result Content */}
                <div className="pt-6 px-6 pb-2 grid md:grid-cols-2 gap-2">
                    {/* Quiz Details */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-100 rounded-lg p-5 shadow-md"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
                            Quiz Details
                        </h2>
                        <div className="space-y-3">
                            <p>
                                <span className="font-semibold">Title:</span> {result.quiz.title}
                            </p>
                            <p>
                                <span className="font-semibold">Description:</span> {result.quiz.description}
                            </p>
                            <p>
                                <span className="font-semibold">Score:</span> <span className={`font-semibold ${getTestColor(result.score)}`}> {result.score.toFixed(2)}%</span>
                            </p>
                            <p>
                                <span className="font-semibold">Completed:</span> {new Date(result.completedAt).toLocaleString()}
                            </p>
                        </div>
                    </motion.div>

                    {/* Score Visualization */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-100 rounded-lg p-5 shadow-md flex flex-col items-center"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
                            Score Breakdown
                        </h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={resultData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {resultData.map((__, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center space-x-4 mt-4">
                            <div className="flex items-center">
                                <div className="w-4 h-4 mr-2 bg-green-500"></div>
                                <span>Correct</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 mr-2 bg-pink-500"></div>
                                <span>Incorrect</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* User Info and Actions */}
                <div className="px-6 grid md:grid-cols-2 gap-2 pb-6">
                    {/* User Information */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="bg-zinc-100 rounded-lg p-5 shadow-md"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
                            User Information
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                {/* Placeholder for user avatar/gravatar */}
                                <div className="w-16 h-16 bg-blue-200 rounded-full mr-4 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-blue-700">
                                        {result.user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-lg">{result.user.name}</p>
                                    <div className="flex items-center">
                                        <span className="mr-2">{result.user.email}</span>
                                        <CopyToClipboard
                                            text={result.user.email}
                                            onCopy={handleCopy}
                                        >
                                            <button
                                                className={`text-gray-500 hover:text-blue-500 transition ${isCopied ? 'text-green-500' : ''}`}
                                                title="Copy Email"
                                            >
                                                <ClipboardCopyIcon size={16} />
                                            </button>
                                        </CopyToClipboard>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="p-5 flex flex-col space-y-4"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 pb-2">
                            Next Steps
                        </h2>
                        <button
                            onClick={() => navigate('/quizzes')}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
                        >
                            <ListIcon className="mr-2" /> View All Quizzes
                        </button>
                        <button
                            onClick={handleShareResult}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
                        >
                            <ShareIcon className="mr-2" /> Share Result
                        </button>
                        <button
                            onClick={() => navigate(`/take-quiz/${result.quiz.id}`)}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
                        >
                            <RefreshCwIcon className="mr-2" /> Retry Quiz
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ResultPage;

// Note to developer:
// To use this component, you'll need to install the following dependencies:
// - framer-motion
// - recharts
// - react-toastify
// - react-copy-to-clipboard
// - lucide-react

// Recommended Tailwind CSS configuration in tailwind.config.js:
// module.exports = {
//   theme: {
//