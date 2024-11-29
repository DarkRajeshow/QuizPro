import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { Quiz } from '../../utils/types';

const AdminPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const fetchedQuizzes = await api.getQuizzes();
        setQuizzes(fetchedQuizzes);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch quizzes', error);
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <Link 
            to="/"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Create New Quiz
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div className="text-center text-gray-600">No quizzes created yet</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <div 
                key={quiz.id} 
                className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition duration-300"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {quiz.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {quiz.description || 'No description'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {quiz.questions.length} Questions
                  </span>
                  <Link
                    to={`/quiz/${quiz.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;