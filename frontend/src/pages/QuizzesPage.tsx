import React, { useState, useContext, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { AuthContext } from '../App';
import { api } from '../utils/api';
import QuizCard from '../components/reusable/QuizCard';



interface Question {
    id: string; // Assuming the ID is a string
    type: string; // Type of the question (e.g., "multiple-choice", "true/false")
    text: string; // The text of the question
}

interface QuizCount {
    questions: number; // Total number of questions in the quiz
    attempts: number; // Total number of attempts made for the quiz
}

interface Quiz {
    id: string; // Unique identifier for the quiz
    title: string; // Title of the quiz
    description: string; // Description of the quiz
    startDate: Date; // Start date of the quiz
    creatorId: Date; // Start date of the quiz
    expiryDate: Date; // Expiration date of the quiz
    questions: Question[]; // Array of questions in the quiz
    _count: QuizCount; // Count of questions and attempts
    isAvailable: boolean; // Indicates if the quiz is currently available
    userAttempts: number; // Number of attempts made by the logged-in user
    maxAttempts: number; // Number of attempts made by the logged-in user
    createdAt: string;
}


const QuizzesPage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'my' | 'popular'>('popular');
    const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([]);
    const [popularQuizzes, setPopularQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userQuizzesTemp = await api.getUserQuizzes();
                const popularQuizzesTemp = await api.getPopularQuizzes();

                setUserQuizzes(userQuizzesTemp);
                setPopularQuizzes(popularQuizzesTemp);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch data', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Advanced filtering and search
    const filteredQuizzes = useMemo(() => {
        let quizzes: Quiz[] = [];

        if (activeFilter === 'my' && user.role !== "QUIZ_TAKER") {
            quizzes = userQuizzes;
        } else if (activeFilter === 'popular') {
            quizzes = popularQuizzes;
        }

        return quizzes.filter(quiz =>
            quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, activeFilter, userQuizzes, popularQuizzes, user]);

    const navigateOptions = user && user.role === "QUIZ_MAKER" ? ['popular', 'my'] : ['popular']
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 md:p-16">
            {/* Search and Filter Section */}
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6"
            >
                {/* Search Input */}
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Search for quizzes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border-2 bg-white border-gray-200 transition-all duration-300"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {/* Filter Buttons */}
                <div className="flex space-x-2">
                    {navigateOptions.map((filter) => (
                        <motion.button
                            key={filter}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveFilter(filter as 'my' | 'popular')}
                            className={`
                                px-4 py-2 capitalize transition-all
                                ${activeFilter === filter
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                            `}
                        >
                            {filter}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Quizzes Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "easeInOut"
                        }}
                        className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
                    />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                >
                    {filteredQuizzes.map((quiz) => (
                        <QuizCard
                            key={quiz.id}
                            id={quiz.id}
                            title={quiz.title}
                            description={quiz.description}
                            createdAt={quiz.createdAt}
                            totalQuestions={quiz.questions.length}
                            startDate={quiz.startDate}
                            expiryDate={quiz.expiryDate}
                            maxAttempts={quiz.maxAttempts}
                            userAttempts={quiz.userAttempts}
                            difficulty='medium'
                            category='General'
                            isUserQuize={user.id === quiz.creatorId || user.role === "ADMIN"}
                        />
                    ))}
                </motion.div>
            )}

            {/* Empty State */}
            {filteredQuizzes.length === 0 && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                >
                    <p className="text-2xl text-gray-500">No quizzes found</p>
                    <p className="text-gray-400 mt-2">Try a different search or filter</p>
                </motion.div>
            )}
        </div>
    );
};

export default QuizzesPage;