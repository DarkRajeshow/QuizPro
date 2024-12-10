import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useNavigate
} from 'react-router-dom';
import {
    Clock,
    Share2,
    TrendingUp,
    Award,
    Target,
    ChevronRight,
    Lock,
    Unlock,
    Info,
    PencilIcon
} from 'lucide-react';

interface QuizCardProps {
    id: string;
    title: string;
    description: string | null;
    userAttempts: number;
    totalQuestions: number;
    createdAt: string;
    startDate?: Date | null;
    expiryDate?: Date | null;
    maxAttempts: number;
    isUserQuize?: boolean;
    difficulty?: 'easy' | 'medium' | 'hard';
    category?: string;
}

const DifficultyBadge: React.FC<{ difficulty: 'easy' | 'medium' | 'hard' }> = ({ difficulty }) => {
    const difficultyColors = {
        easy: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        hard: 'bg-red-100 text-red-800'
    };

    return (
        <span className={`
            px-2 py-0.5 rounded-full text-xs font-semibold uppercase
            ${difficultyColors[difficulty]}
        `}>
            {difficulty}
        </span>
    );
};

const QuizCard: React.FC<QuizCardProps> = ({
    id,
    title,
    description,
    totalQuestions,
    startDate,
    expiryDate,
    maxAttempts,
    userAttempts,
    isUserQuize = false,
    difficulty = 'medium',
    category = 'General'
}) => {
    const navigate = useNavigate();
    const [quizStatus, setQuizStatus] = useState<'not_started' | 'ongoing' | 'expired'>('not_started');
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        const now = new Date();
        if (startDate && now < new Date(startDate)) {
            setQuizStatus('not_started');
        } else if (expiryDate && now > new Date(expiryDate)) {
            setQuizStatus('expired');
        } else {
            setQuizStatus('ongoing');
        }
    }, [id, startDate, expiryDate]);

    const handleQuizNavigation = () => {
        if (userAttempts >= maxAttempts) {
            alert(`You have reached the maximum number of attempts (${maxAttempts}) for this quiz.`);
            return;
        }

        const now = new Date();
        if (startDate && now < new Date(startDate)) {
            alert(`This quiz becomes available on ${new Date(startDate).toLocaleString()}`);
            return;
        }

        if (expiryDate && now > new Date(expiryDate)) {
            alert('This quiz has expired and is no longer available.');
            return;
        }

        navigate(`/take-quiz/${id}`);
    };

    const handleShare = async () => {
        const quizUrl = `${window.location.origin}/take-quiz/${id}`;
        const shareData = {
            title: title,
            text: description || 'Check out this quiz!',
            url: quizUrl,
        };

        try {
            await navigator.share(shareData);
            console.log('Share successful');
        } catch (err) {
            console.error('Share failed: ', err);
            navigator.clipboard.writeText(quizUrl)
                .then(() => alert('Quiz link copied to clipboard!'))
                .catch(err => console.error('Failed to copy: ', err));
        }
    };

    const renderQuizStatusBadge = () => {
        switch (quizStatus) {
            case 'not_started':
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center"
                    >
                        <Clock className="w-3 h-3 mr-1" />
                        Not Started
                    </motion.div>
                );
            case 'expired':
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center"
                    >
                        <Lock className="w-3 h-3 mr-1" />
                        Expired
                    </motion.div>
                );
            default:
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center"
                    >
                        <Unlock className="w-3 h-3 mr-1" />
                        Active
                    </motion.div>
                );
        }
    };

    const DetailModal = () => (
        <AnimatePresence>
            {showDetailModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowDetailModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                        className="bg-white rounded-xl p-6 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold mb-4">{title}</h2>
                        <p className="text-gray-600 mb-4">{description || 'No description provided'}</p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-500 flex items-center">
                                    <Target className="w-4 h-4 mr-2 text-blue-500" />
                                    Category
                                </p>
                                <p className="font-semibold">{category}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                                    Difficulty
                                </p>
                                <DifficultyBadge difficulty={difficulty} />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
                type: "inertia",
                velocity: 50
            }}
            className="relative bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl"
        >
            <div className='absolute top-4 left-4 flex items-center justify-start gap-2 w-full'>
                {renderQuizStatusBadge()}
                {isUserQuize && <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => navigate(`/quizzes/${id}`)}
                    className="bg-blue-100 text-blue-900 px-2 py-1 rounded-full text-xs flex items-center gap-1 cursor-pointer"
                >
                    <PencilIcon className='size-3' />
                    Edit
                </motion.div>}
            </div>
            {/* Card Content */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-4 mt-3">
                    <div className=''>
                        <h3 className="text-xl font-semibold py-4 text-gray-800 mb-2 flex items-center capitalize">
                            {title}
                            {isUserQuize && (
                                <Award className="w-5 h-5 ml-2 text-yellow-500" />
                            )}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <DifficultyBadge difficulty={difficulty} />
                            <span className="text-sm text-gray-500 flex items-center">
                                <Clock aria-label='lsfjldj' className="w-4 h-4 mr-1 text-gray-400" />

                                {((quizStatus === "ongoing" || quizStatus === "expired") && expiryDate) && new Date(expiryDate).toDateString() + "_" + new Date(expiryDate).toLocaleTimeString()}

                                {((quizStatus === "not_started") && startDate) && (new Date(startDate).toDateString() + "_" + new Date(startDate).toLocaleTimeString())}
                            </span>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowDetailModal(true)}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        <Info className="w-5 h-5" />
                    </motion.button>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {description || 'No description provided'}
                </p>

                {/* Quiz Statistics */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-100 rounded-lg p-4 h-24 flex flex-col items-center justify-center gap-2 text-center">
                        <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-600" />
                        <span className="text-xs text-gray-700">
                            {totalQuestions} Questions
                        </span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4 h-24 flex flex-col items-center justify-center gap-2 text-center">
                        <Award className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
                        <span className="text-xs text-gray-700">
                            {userAttempts}/{maxAttempts} Attempts
                        </span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4 h-24 flex flex-col items-center justify-center gap-2 text-center">
                        <Share2
                            onClick={handleShare}
                            className="w-5 h-5 mx-auto mb-1 text-blue-600 cursor-pointer hover:text-blue-800"
                        />
                        <span className="text-xs text-gray-700">
                            Share
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                    {isUserQuize && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/quiz-results/${id}`)}
                            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition"
                        >
                            View Results
                        </motion.button>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleQuizNavigation}
                        disabled={quizStatus !== 'ongoing' || userAttempts >= maxAttempts}
                        className={`
                            px-4 py-2 rounded-lg flex items-center justify-center
                            ${quizStatus !== 'ongoing' || userAttempts >= maxAttempts
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'}
                        `}
                    >
                        {userAttempts >= maxAttempts ? 'Max Attempts' : 'Start Quiz'}
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </motion.button>
                </div>
            </div>

            <DetailModal />
        </motion.div>
    );
};

export default QuizCard;