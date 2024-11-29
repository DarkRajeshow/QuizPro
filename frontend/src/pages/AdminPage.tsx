import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    ResponsiveContainer
} from 'recharts';
import {
    Users,
    BookOpen,
    Trophy,
    Clock,
    TrendingUp,
    PlusCircle,
    Filter
} from 'lucide-react';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';

interface AdminData {
    totalUsers: number;
    totalQuizzes: number;
    totalQuestions: number;
    averageQuizScore: number;
    topQuizzes: TopQuiz[];
    userActivityData: ActivityData[];
    questionTypeDistribution: QuestionTypeData[];
    recentActivities: RecentActivity[];
}

interface TopQuiz {
    name: string;
    averageScore: number;
    totalAttempts: number;
    createdDate: string;
}

interface ActivityData {
    date: string;
    signups: number;
    quizCompletions: number;
}

interface QuestionTypeData {
    type: string;
    count: number;
}

interface RecentActivity {
    userName: string;
    quizTitle: string;
    score: number;
    dateOfAttempt: string;
}

const AdminDashboard: React.FC = () => {
    const [adminData, setAdminData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const data = await api.getAdminData();
                setAdminData(data);
                console.log(data);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching admin data:', error);
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
            </div>
        );
    }

    if (!adminData) {
        return <div>Error loading data</div>;
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Hero Section */}
            <section className="grid grid-cols-4 gap-6 mb-12">
                <div className="bg-white shadow-md p-6 flex items-center rounded-md">
                    <Users className="w-12 h-12 text-blue-500 mr-4" />
                    <div>
                        <h3 className="text-xl font-bold text-gray-700">Total Users</h3>
                        <p className="text-3xl font-extrabold text-blue-600">{adminData.totalUsers}</p>
                    </div>
                </div>
                <div className="bg-white shadow-md p-6 flex items-center  rounded-md">
                    <BookOpen className="w-12 h-12 text-green-500 mr-4" />
                    <div>
                        <h3 className="text-xl font-bold text-gray-700">Total Quizzes</h3>
                        <p className="text-3xl font-extrabold text-green-600">{adminData.totalQuizzes}</p>
                    </div>
                </div>
                <div className="bg-white shadow-md p-6 flex items-center">
                    <Trophy className="w-12 h-12 text-purple-500 mr-4" />
                    <div>
                        <h3 className="text-xl font-bold text-gray-700">Avg Quiz Score</h3>
                        <p className="text-3xl font-extrabold text-purple-600">
                            {adminData.averageQuizScore.toFixed(2)}%
                        </p>
                    </div>
                </div>
                <div className="bg-white shadow-md p-6 flex items-center  rounded-md">
                    <Clock className="w-12 h-12 text-red-500 mr-4" />
                    <div>
                        <h3 className="text-xl font-bold text-gray-700">Total Questions</h3>
                        <p className="text-3xl font-extrabold text-red-600">{adminData.totalQuestions}</p>
                    </div>
                </div>
            </section>

            {/* Charts and Insights */}
            <div className="grid grid-cols-2 gap-8">
                {/* Quiz Performance Insights */}
                <div className="bg-white shadow-md p-6  rounded-md">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Top Quiz Performances</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={adminData.topQuizzes}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="averageScore" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* User Engagement */}
                <div className="bg-white shadow-md p-6  rounded-md">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">User Activity</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={adminData.userActivityData}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="signups" stroke="#8884d8" />
                            <Line type="monotone" dataKey="quizCompletions" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Question Type Distribution */}
                <div className="bg-white shadow-md p-6  rounded-md">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Question Type Distribution</h2>
                    <ResponsiveContainer width="100%" height={500}>
                        <PieChart width={400} height={400}>
                            <Pie
                                data={adminData.questionTypeDistribution}
                                cx="50%"
                                cy="50%"
                                outerRadius={160}
                                label={({ type, count }) => `${type}: ${count}`}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {adminData.questionTypeDistribution.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip formatter={(name) => [`${name}`]} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Activities */}
                <div className="bg-white shadow-md p-6  rounded-md">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Recent Activities</h2>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="border rounded px-2 py-1"
                            >
                                <option value="all">All</option>
                                <option value="last7days">Last 7 Days</option>
                                <option value="last30days">Last 30 Days</option>
                            </select>
                        </div>
                    </div>
                    <div className='h-[500px] overflow-auto'>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2">User</th>
                                    <th className="p-2">Quiz</th>
                                    <th className="p-2">Score</th>
                                    <th className="p-2">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminData.recentActivities.map((activity, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-2">{activity.userName}</td>
                                        <td className="p-2">{activity.quizTitle}</td>
                                        <td className="p-2">{activity.score.toFixed(2)}%</td>
                                        <td className="p-2">{new Date(activity.dateOfAttempt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <section className="mt-12 grid grid-cols-3 gap-6">
                <Link to={'/quizzes/create'} className="bg-blue-500 text-white py-3 hover:bg-blue-600 flex items-center justify-center rounded-sm">
                    <PlusCircle className="mr-2" /> Create New Quiz
                </Link>
                <button className="bg-green-500 text-white py-3 hover:bg-green-600 flex items-center justify-center rounded-sm">
                    <Users className="mr-2" /> Manage Users
                </button>
                <button className="bg-purple-500 text-white py-3 hover:bg-purple-600 flex items-center justify-center rounded-sm">
                    <TrendingUp className="mr-2" /> View All Attempts
                </button>
            </section>
        </div >
    );
};

export default AdminDashboard;