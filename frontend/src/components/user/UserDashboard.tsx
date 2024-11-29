import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { Quiz, Result } from '../../utils/types';

const UserPage: React.FC = () => {
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [userResults, setUserResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quizzes = await api.getQuizzes();
        const results = await api.getUserResults();
        

        console.log(quizzes);
        
        setAvailableQuizzes(quizzes);
        setUserResults(results);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Quizzes</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Available Quizzes Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Available Quizzes</h2>
            {loading ? (
              <div>Loading quizzes...</div>
            ) : availableQuizzes.length === 0 ? (
              <div>No quizzes available</div>
            ) : (
              <div className="space-y-4">
                {availableQuizzes.map((quiz) => (
                  <div 
                    key={quiz.id} 
                    className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold">{quiz.title}</h3>
                      <p className="text-sm text-gray-600">
                        {quiz.questions.length} Questions
                      </p>
                    </div>
                    <Link
                      to={`/quiz/${quiz.id}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Start Quiz
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quiz Results Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">My Results</h2>
            {loading ? (
              <div>Loading results...</div>
            ) : userResults.length === 0 ? (
              <div>No quiz results yet</div>
            ) : (
              <div className="space-y-4">
                {userResults.map((result) => (
                  <div 
                    key={result.id} 
                    className="bg-white shadow-md rounded-lg p-4"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-semibold">
                        {result.quizId}
                      </h3>
                      <span 
                        className={`font-bold ${
                          result.score > 70 
                            ? 'text-green-600' 
                            : result.score > 50 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                        }`}
                      >
                        {result.score.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Completed on: {new Date(result.completedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;