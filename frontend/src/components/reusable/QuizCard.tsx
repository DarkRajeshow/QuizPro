import React from 'react';
import { useNavigate } from 'react-router-dom';

interface QuizCardProps {
    id: string;
    title: string;
    description: string | null;
    totalAttempts: number;
    totalQuestions: number;
    createdAt: string;
    isUserQuize?: boolean
}

const QuizCard: React.FC<QuizCardProps> = ({ id, title, description, totalAttempts, createdAt, totalQuestions, isUserQuize = false }) => {


    const navigate = useNavigate()
    const navigateToQuize = () => {
        navigate(`/quizzes/${id}`)
    }

    const navigateToQuizeResults = () =>{
        navigate(`/quiz-results/${id}`)
    }
    return (
        <div className="bg-zinc-50 border-2 border-zinc-200 p-8 transition">
            <span className='text-zinc-400 text-sm'>{new Date(createdAt).toLocaleDateString()}</span>
            <div className='items-center justify-between flex gap-2'>
                <h3 className="text-xl font-semibold capitalize text-gray-800">{title.length > 20 ? title.slice(0, 20) + "..." : title}</h3>
                <span>{totalQuestions} Q.</span>
            </div>
            <p className="text-sm mt-2 text-gray-600">{description || 'No description provided.'}</p>
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <span>Attempts: {totalAttempts}</span>
            </div>

            <div className='pt-4 flex items-center justify-end gap-2 mt-2 '>
                {isUserQuize && <button onClick={navigateToQuizeResults} className='bg-red-200 text-black transition-none w-[50%]'>All Results</button>}
                <button onClick={navigateToQuize} className='bg-green-200 text-black transition-none w-[50%]'>Start Quiz</button>
            </div>
        </div>
    );
};

export default QuizCard;
