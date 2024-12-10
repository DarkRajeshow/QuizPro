import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
    Book,
    TrendingUp,
    PlusCircle,
    ChevronRight,
    Rocket
} from 'lucide-react';
import { AuthContext } from '../App';

const Home: React.FC = () => {
    const { isAuthenticated, user } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
            {/* Hero Section */}
            <section className="relative py-20 px-6 lg:px-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-200 opacity-50 -z-10"></div>

                <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h1 className="text-5xl leading-tight font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Empower Your Learning Journey with QuizPro!
                        </h1>

                        <p className="text-xl text-gray-700">
                            Transform learning into an engaging, personalized experience. Create, attempt, and track quizzes that adapt to your unique learning style.
                        </p>

                        {!isAuthenticated ? <div className="flex space-x-4">
                            <Link
                                to="/login"
                                className="flex items-center gap-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded- transition-all transform hover:scale-105 shadow-lg"
                            >
                                Ready to Start? Join Us Now!
                                <Rocket className="w-8 h-8" />
                            </Link>

                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all transform hover:scale-105"
                            >
                                Log In and Begin Your Quiz Journey
                                <ChevronRight className="w-8 h-8" />
                            </Link>
                        </div> :
                            user.role === "ADMIN" ? <div className="flex space-x-4">
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded- transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Admin
                                    <Rocket className="w-8 h-8" />
                                </Link>

                                <Link
                                    to="/quizzes/create"
                                    className="flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all transform hover:scale-105"
                                >
                                    Create New Quiz
                                    <ChevronRight className="w-8 h-8" />
                                </Link>
                            </div> : (
                                <div className="flex space-x-4">
                                    <Link
                                        to="/quizzes"
                                        className="flex items-center gap-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded- transition-all transform hover:scale-105 shadow-lg"
                                    >
                                        Quizzes
                                        <Rocket className="w-8 h-8" />
                                    </Link>
                                    {user && user.role !== "QUIZ_TAKER" ?
                                        <Link
                                            to="/quizzes/create"
                                            className="flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all transform hover:scale-105"
                                        >
                                            Create New Quiz
                                            <ChevronRight className="w-8 h-8" />
                                        </Link> : <Link
                                            to="/attempts"
                                            className="flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all transform hover:scale-105"
                                        >
                                            Check your attempts
                                            <ChevronRight className="w-8 h-8" />
                                        </Link>}
                                </div>
                            )
                        }
                    </div>

                    <div className="relative cursor-pointer h-[360px] overflow-hidden group shadow-2xl rounded-md">
                        <div className="bg-white/60 backdrop-blur-lg p-6 shadow-2xl absolute w-full h-full">
                            <img
                                src="/admin.jpeg"
                                alt="QuizPro Dashboard"
                                className="transform transition-transform duration-1000 group-hover:-translate-y-56"
                            />
                        </div>
                    </div>

                </div>
            </section>

            {/* Feature Sections */}
            <div className="px-6 lg:px-20 py-16 space-y-16">
                {/* Create Quiz Section */}
                <section className="bg-white rounded-md shadow-lg p-8 py-28 flex items-center gap-12">
                    <div className="flex-1">
                        <img
                            src='/create.jpeg'
                            alt="Quiz Creation"
                            className="shadow-md hover:shadow-xl transition-shadow rounded-md"
                        />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-4xl font-bold mb-4 text-green-700">Create Your First Quiz Today!</h2>
                        <p className="text-gray-600 mb-6">
                            Craft engaging, interactive quizzes with our intuitive creation tools. Customize, preview, and publish in minutes.
                        </p>
                        <Link
                            to="/quizzes/create"
                            className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition-colors"
                        >
                            <PlusCircle className="w-5 h-5" />
                            Start Creating
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>

                {/* Quiz Attempt Section */}
                <section className="bg-white rounded-md shadow-lg p-8 py-28 flex items-center gap-12">
                    <div className="flex-1">
                        <h2 className="text-4xl font-bold mb-4 text-blue-700">Discover Quizzes Tailored for You!</h2>
                        <p className="text-gray-600 mb-6">
                            Explore a wide range of quizzes designed to challenge and enhance your skills across various domains.
                        </p>
                        <Link
                            to="/quizzes"
                            className="flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full transition-colors"
                        >
                            <Book className="w-5 h-5" />
                            Browse Quizzes
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="flex-1">
                        <img
                            src='/quizzes.jpeg'
                            alt="Quiz Selection"
                            className="shadow-md hover:shadow-xl transition-shadow rounded-md"
                        />
                    </div>
                </section>

                {/* Performance Tracking Section */}
                <section className="bg-white rounded-md shadow-lg p-8 py-28 flex items-center gap-12">
                    <div className="flex-1">
                        <img
                            src='/results.jpeg'
                            alt="Performance Tracking"
                            className="shadow-md hover:shadow-xl transition-shadow rounded-md"
                        />
                    </div>

                    <div className="flex-1">
                        <h2 className="text-4xl font-bold mb-4 text-purple-700">Review Your Candidate's Progress and Aim Higher!</h2>
                        <p className="text-gray-600 mb-6">
                            Track your learning journey with detailed performance analytics. Identify strengths, improve weaknesses, and visualize your growth.
                        </p>
                        <Link
                            to="/attempts"
                            className="flex items-center gap-2 px-6 py-3 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-full transition-colors"
                        >
                            <TrendingUp className="w-5 h-5" />
                            View Performance
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>

                </section>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-6 lg:px-20">
                <div className="container mx-auto grid md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-2xl font-bold mb-4">QuizPro</h3>
                        <p className="text-gray-400">Revolutionizing learning through interactive, personalized quizzes.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <nav className="space-y-2">
                            <Link to="/quizzes" className="block hover:text-blue-400 transition-colors">Explore Quizzes</Link>
                            {user && user.role !== "QUIZ_TAKER" && <Link to="/quizzes/create" className="block hover:text-blue-400 transition-colors">Create Quiz</Link>}
                            <Link to="/attempts" className="block hover:text-blue-400 transition-colors">Attempts</Link>
                        </nav>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Connect</h4>
                        <div className="flex space-x-4">
                            {/* Social media icons will be added in the future. */}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;