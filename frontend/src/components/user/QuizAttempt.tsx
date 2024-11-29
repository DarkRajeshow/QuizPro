import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { Quiz, QuestionType, QuizAttemptState } from '../../utils/types';
import Loader from '../ui/Loader';

const QuizAttempt: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [state, setState] = useState<QuizAttemptState>({
        currentQuestionIndex: 0,
        selectedAnswers: {},
        timeRemaining: 600 // 10 minutes
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const fetchedQuiz = await api.getQuizById(quizId!);

                if (fetchedQuiz && fetchedQuiz.duration) {
                    setState((prev) => ({
                        ...prev,
                        timeRemaining: fetchedQuiz.duration * 60
                    }))
                }
                setQuiz(fetchedQuiz);
            } catch (error) {
                console.error('Failed to fetch quiz', error);
            }
        };

        fetchQuiz();

        // Timer countdown
        const timer = setInterval(() => {
            setState(prev => ({
                ...prev,
                timeRemaining: prev.timeRemaining - 1
            }));
        }, 1000);

        return () => clearInterval(timer);
    }, [quizId]);

    const handleAnswerSelect = (answer: string) => {
        setState(prev => ({
            ...prev,
            selectedAnswers: {
                ...prev.selectedAnswers,
                [quiz!.questions[prev.currentQuestionIndex].id]: answer
            }
        }));
    };

    const moveToNextQuestion = () => {
        setState(prev => ({
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1
        }));
    };

    const submitQuiz = async () => {
        if (!quiz) return;

        try {
            const result = await api.submitQuizResult({
                quizId: quiz.id,
                score: calculateScore(),
                totalQuestions: quiz.questions.length
            });

            console.log(result?.id);

            navigate(`/results/${result?.id}`)
        } catch (error) {
            console.error('Failed to submit quiz', error);
        }
    };

    const calculateScore = () => {
        let score = 0;
        quiz?.questions.forEach(question => {
            if (state.selectedAnswers[question.id] === question.correctAnswer) {
                score++;
            }
        });
        return (score / quiz!.questions.length) * 100;
    };

    if (!quiz) return <Loader />;

    const currentQuestion = quiz.questions[state.currentQuestionIndex];

    return (
        <div className="py-6 px-20 bg-white h-[90vh] relative">
            <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">{quiz.title}</h2>
                <div className="text-red-500">
                    Time Remaining: {Math.floor(state.timeRemaining / 60)}:
                    {(state.timeRemaining % 60).toString().padStart(2, '0')}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">
                    Question {state.currentQuestionIndex + 1}
                </h3>
                <p className="mb-4">{currentQuestion.text}</p>

                {currentQuestion.type === QuestionType.MULTIPLE_CHOICE ? (
                    currentQuestion.options.map((option, index) => (
                        <div
                            key={index}
                            className='flex items-center justify-center gap-2 mb-2'
                        >
                            <div className="h-10 flex items-center justify-center w-[2%] bg-white border border-zinc-300 text-sm">{index + 1}</div>
                            <button
                                onClick={() => handleAnswerSelect(option)}
                                className={`w-full p-3 border h-10 text-left ${state.selectedAnswers[currentQuestion.id] === option
                                    ? 'bg-blue-500 text-white'
                                    : 'hover:bg-gray-100 text-black'}`}
                            >
                                {option}
                            </button>
                        </div>
                    ))
                ) : (
                    <>
                        <button
                            onClick={() => handleAnswerSelect('true')}
                            className={`w-full p-3 mb-2 text-black border rounded 
                ${state.selectedAnswers[currentQuestion.id] === 'true'
                                    ? 'bg-blue-500 text-white'
                                    : 'hover:bg-gray-100'}`}
                        >
                            True
                        </button>
                        <button
                            onClick={() => handleAnswerSelect('false')}
                            className={`w-full p-3 mb-2 text-black border rounded 
                ${state.selectedAnswers[currentQuestion.id] === 'false'
                                    ? 'bg-blue-500 text-white'
                                    : 'hover:bg-gray-100'}`}
                        >
                            False
                        </button>
                    </>
                )}
            </div>

            <div className="flex justify-between absolute bottom-10 w-[89%]">
                {state.currentQuestionIndex > 0 && (
                    <button
                        onClick={() => setState(prev => ({
                            ...prev,
                            currentQuestionIndex: prev.currentQuestionIndex - 1
                        }))}
                        className="bg-gray-500"
                    >
                        Previous
                    </button>
                )}

                {state.currentQuestionIndex < quiz.questions.length - 1 ? (
                    <button
                        onClick={moveToNextQuestion}
                        disabled={!state.selectedAnswers[currentQuestion.id]}
                        className="bg-blue-500"
                    >
                        Next Question
                    </button>
                ) : (
                    <button
                        onClick={submitQuiz}
                        className="bg-green-600"
                    >
                        Submit Quiz
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizAttempt;