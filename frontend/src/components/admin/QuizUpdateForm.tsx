import React, { useState, useEffect, useContext } from 'react';
import { api } from '../../utils/api';
import { QuestionType, Question } from '../../utils/types';
import SingleQuestion from './SingleQuestion';
import QuestionCard from './QuestionCard';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusCircle, Save, Clock, RefreshCw } from 'lucide-react';
import { AuthContext } from '../../App';

const QuizUpdateForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(10);
    const [maxAttempts, setMaxAttempts] = useState(1);
    const [startDate, setStartDate] = useState<string>('');
    const [expiryDate, setExpiryDate] = useState<string>('');
    const [questions, setQuestions] = useState<Partial<Question>[]>([]);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const { user } = useContext(AuthContext)
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();


    const fetchQuizData = async () => {
        if (!quizId) {
            toast.error('Quiz ID is required');
            return;
        }

        try {
            setIsLoading(true);
            const quizData = await api.getQuizById(quizId);
            console.log(user.id);
            console.log(quizData.creatorId);
            console.log(quizData);

            if (user.role !== "ADMIN" && user.id !== quizData.creatorId) {
                toast.info("You are not authorized to edit the quiz.")
                navigate('/quizzes');
                return;
            }
            // Populate form fields
            setTitle(quizData.title);
            setDescription(quizData.description || '');
            setDuration(quizData.duration);
            setMaxAttempts(quizData.maxAttempts);

            
            // Convert dates to local datetime-local format
            setStartDate(quizData.startDate ? new Date(quizData.startDate).toISOString().slice(0, 16) : '');
            setExpiryDate(quizData.expiryDate ? new Date(quizData.expiryDate).toISOString().slice(0, 16) : '');

            // Populate questions, ensuring a default if no questions exist
            const fetchedQuestions = quizData.questions.length > 0
                ? quizData.questions
                : [{
                    type: QuestionType.MULTIPLE_CHOICE,
                    text: '',
                    options: ['', '', '', ''],
                    correctAnswer: []
                }];

            setQuestions(fetchedQuestions);
            setQuestionIndex(0);
        } catch (error) {
            toast.error('Failed to fetch quiz data');
            console.error(error);
            navigate('/quizzes');
        } finally {
            setIsLoading(false);
        }
    };
    // Fetch existing quiz data on component mount

    useEffect(() => {
        fetchQuizData();
    }, [quizId, navigate]);

    const addQuestion = () => {
        const newQuestionIndex = questions.length;
        setQuestionIndex(newQuestionIndex);
        setQuestions([...questions, {
            type: QuestionType.MULTIPLE_CHOICE,
            text: '',
            options: ['', '', '', ''],
            correctAnswer: []
        }]);
    };

    const updateQuestion = (index: number, updates: Partial<Question>) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], ...updates };
        setQuestions(newQuestions);
    };

    const removeQuestion = (index: number) => {
        if (questions.length <= 1) {
            toast.error("A quiz must have at least one question.");
            return;
        }

        if (index === questionIndex) {
            setQuestionIndex(0);
        } else if (questionIndex > index) {
            setQuestionIndex((prev) => prev - 1);
        }

        const tempQuestions = [...questions];
        tempQuestions.splice(index, 1);
        setQuestions(tempQuestions);
    };

    const validateQuestions = () => {
        return questions.every((q) => {
            // Validate common fields
            if (!q.type || !q.text) return false;

            // Validate based on question type
            switch (q.type) {
                case QuestionType.MULTIPLE_CHOICE:
                    return q.options && q.options.length > 0 &&
                        q.correctAnswer && q.correctAnswer.length > 0;
                case QuestionType.TRUE_FALSE:
                    return q.correctAnswer && q.correctAnswer.length === 1;
                case QuestionType.FILL_IN_BLANK:
                    return q.correctAnswer && q.correctAnswer.length === 1;
                case QuestionType.MULTI_ANSWER:
                    return q.correctAnswer && q.correctAnswer.length > 0;
                default:
                    return false;
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();


        // Validate quiz details
        if (!title) {
            toast.error("Quiz title is required.");
            return;
        }

        // Validate questions
        if (!validateQuestions()) {
            toast.error("Please complete all questions with valid answers.");
            return;
        }

        try {
            await api.updateQuiz(quizId!, {
                title,
                description,
                questions: questions as Question[],
                duration,
                maxAttempts,
                startDate: startDate ? new Date(startDate) : undefined,
                expiryDate: expiryDate ? new Date(expiryDate) : undefined
            });

            toast.success("Quiz updated successfully.");
            navigate("/quizzes");

        } catch (error) {
            toast.error('Failed to update quiz');
            console.error(error);
        }
    };

    // Reset form to original data
    const handleReset = () => {
        // Trigger a re-fetch of the quiz data
        fetchQuizData()
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin">
                    <Clock size={48} />
                </div>
                <p className="ml-4 text-lg">Loading quiz data...</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-lg text-sm">
            <div className='grid grid-cols-5'>
                <div className='bg-gray-50 p-4 border-r overflow-y-auto h-full'>
                    <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                        Questions ({questions.length})
                    </h2>
                    <div className='space-y-2'>
                        {questions.map((question, index) => (
                            <QuestionCard
                                key={index}
                                removeQuestion={removeQuestion}
                                setQuestionIndex={setQuestionIndex}
                                question={question as Question}
                                questionIndex={questionIndex}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
                <form onSubmit={handleSubmit} className='col-span-4 p-6 space-y-4'>
                    <div className='grid grid-cols-7 gap-6'>
                        <div className='col-span-4 flex flex-col gap-4'>
                            <div>
                                <label className="block mb-2 font-medium">Quiz Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-2 border-2"
                                    required
                                    placeholder="Enter quiz title"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full h-[210px] p-2 border-2"
                                    placeholder="Enter quiz description"
                                />
                            </div>
                        </div>

                        <div className='col-span-3 flex flex-col gap-4'>
                            <div>
                                <label className="mb-2 font-medium flex items-center gap-2">
                                    <Clock size={16} /> Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className="w-full p-2 border-2"
                                    min={1}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Max Attempts</label>
                                <input
                                    type="number"
                                    value={maxAttempts}
                                    onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
                                    className="w-full p-2 border-2"
                                    min={1}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Start Date (Optional)</label>
                                <input
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full p-2 border-2"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Expiry Date (Optional)</label>
                                <input
                                    type="datetime-local"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    className="w-full p-2 border-2"
                                />
                            </div>
                        </div>
                    </div>

                    {(questions && questions.length !== 0) && (
                        <SingleQuestion
                            question={questions[questionIndex] as Question}
                            updateQuestion={updateQuestion}
                            index={questionIndex}
                        />
                    )}

                    <div className='flex justify-between'>
                        <div className='flex gap-4'>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="flex items-center text-blue-600 hover:text-blue-800"
                            >
                                <PlusCircle size={20} className="mr-2" />
                                Add Question
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex items-center text-gray-600 hover:text-gray-800"
                            >
                                <RefreshCw size={20} className="mr-2" />
                                Reset to Original
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="flex items-center bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
                        >
                            <Save size={20} className="mr-2" />
                            Update Quiz
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuizUpdateForm;