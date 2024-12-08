import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { Question, QuestionType, QuizAttemptState } from '../../utils/types';
import Loader from '../ui/Loader';
import { toast } from 'sonner';
import {
    Timer,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

// Extend the existing interfaces with new properties
interface QuizAttempt {
    id: string;
    completedAt: Date;
    score: number;
}

interface Quiz {
    id: string;
    title: string;
    description?: string;
    startDate: Date;
    expiryDate: Date;
    maxAttempts: number;
    creatorId: string;
    questions: Question[];
    attempts: QuizAttempt[];
    userAttempts: number;
    isAvailable: boolean;
    canAttempt: boolean;
    remainingAttempts: number;
    duration: number; // Added duration
}

// Enhanced QuizAttempt component with improved security and UI features
const QuizAttempt: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [state, setState] = useState<QuizAttemptState>({
        currentQuestionIndex: 0,
        selectedAnswers: {},
        timeRemaining: 0,
        unethicalActivitiesCount: 0,
        reloadAttempts: 0
    });
    const navigate = useNavigate();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);

    // Refs for tracking
    const documentRef = useRef(document);
    const containerRef = useRef<HTMLDivElement>(null);

    // Local storage key for persisting quiz state
    const LOCAL_STORAGE_KEY = `quiz_attempt_${quizId}`;
    const RELOAD_STORAGE_KEY = `quiz_reload_${quizId}`;

    // Prevent default behavior and show warning
    const preventReload = useCallback((e: BeforeUnloadEvent) => {
        // Check if quiz is in progress
        if (quiz && state.timeRemaining > 0) {
            e.preventDefault(); // Cancel the event
            e.returnValue = ''; // Chrome requires this for the dialog to show

            // Increment reload attempts
            const currentReloadAttempts =
                parseInt(localStorage.getItem(RELOAD_STORAGE_KEY) || '0', 10) + 1;
            localStorage.setItem(RELOAD_STORAGE_KEY, currentReloadAttempts.toString());

            // Show warning if reloading multiple times
            if (currentReloadAttempts >= 5) {
                toast.warning("Multiple reload attempts detected. This may result in quiz termination.");
                submitQuiz(); // Auto submit after repeated reload attempts
                return;
            }

            toast.warning("Reloading will interrupt your quiz. Are you sure?");
        }
    }, [quiz, state.timeRemaining]);

    // Initialize full-screen and unethical activity tracking
    useEffect(() => {
        // Retrieve persisted state from local storage
        const persistedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (persistedState) {
            const parsedState = JSON.parse(persistedState);
            setState(prevState => ({
                ...prevState,
                ...parsedState
            }));
        }

        // Add reload prevention
        window.addEventListener('beforeunload', preventReload);

        // Full-screen event listeners
        const handleFullScreenChange = () => {
            const isCurrentlyFullScreen = document.fullscreenElement !== null;

            if (isCurrentlyFullScreen && !isFullScreen) {
                handleUnethicalActivity();
            }
            setIsFullScreen(isCurrentlyFullScreen);
        };

        // Tab visibility change listener
        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleUnethicalActivity();
            }
        };

        // Disable right-click and text selection
        const preventContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const preventSelection = (e: Event) => {
            e.preventDefault();
        };
        // Add event listeners
        documentRef.current.addEventListener('fullscreenchange', handleFullScreenChange);
        documentRef.current.addEventListener('visibilitychange', handleVisibilityChange);
        documentRef.current.addEventListener('contextmenu', preventContextMenu);
        documentRef.current.addEventListener('selectstart', preventSelection);

        // Attempt to enter full-screen mode when quiz starts
        enterFullScreen();

        // Cleanup function
        return () => {
            window.removeEventListener('beforeunload', preventReload);
            documentRef.current.removeEventListener('fullscreenchange', handleFullScreenChange);
            documentRef.current.removeEventListener('visibilitychange', handleVisibilityChange);
            documentRef.current.removeEventListener('contextmenu', preventContextMenu);
            documentRef.current.removeEventListener('selectstart', preventSelection);
        };
    }, [quizId]);

    // Save state to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    // Timer and quiz management effect
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const fetchedQuiz = await api.getQuizById(quizId!);
                if (!fetchedQuiz.canAttempt) {
                    toast.info("You have reached maximum attempts.");
                    navigate('/quizzes')
                    return;
                }
                
                if (fetchedQuiz && fetchedQuiz.duration) {
                    setState((prev) => ({
                        ...prev,
                        timeRemaining: fetchedQuiz.duration * 60
                    }));
                }

                setQuiz(fetchedQuiz);
            } catch (error) {
                console.error('Failed to fetch quiz', error);
                toast.error("Failed to load quiz. Please try again.");
                navigate('/quizzes');
            }
        };

        fetchQuiz();
        // Timer countdown
        const timer = setInterval(() => {
            setState(prev => {
                const newTimeRemaining = prev.timeRemaining - 1;

                // Auto submit when time runs out
                if (newTimeRemaining <= 0) {
                    submitQuiz();
                    clearInterval(timer);
                }

                return {
                    ...prev,
                    timeRemaining: newTimeRemaining
                };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quizId]);


    // Score calculation logic
    const calculateScore = useCallback(() => {
        let score = 0;

        quiz?.questions.forEach(question => {
            const userAnswer = state.selectedAnswers[question.id];

            switch (question.type) {
                case QuestionType.MULTIPLE_CHOICE:
                case QuestionType.TRUE_FALSE:
                    const answer = userAnswer ? userAnswer : ""
                    if (question.correctAnswer.includes(answer as string)) {
                        score++;
                    }
                    break;

                case QuestionType.MULTI_ANSWER:
                    if (Array.isArray(userAnswer) &&
                        Array.isArray(question.correctAnswer) &&
                        userAnswer.length === question.correctAnswer.length &&
                        question.correctAnswer.every(ans => userAnswer.includes(ans))) {
                        score++;
                    }
                    break;

                case QuestionType.FILL_IN_BLANK:
                    if (typeof userAnswer === 'string' &&
                        userAnswer.trim().toLowerCase() === question.correctAnswer[0].trim().toLowerCase()) {
                        score++;
                    }
                    break;
            }
        });
        return (score / quiz!.questions.length) * 100;
    }, [quiz, state.selectedAnswers]);


    // Submit quiz
    const submitQuiz = useCallback(async () => {
        if (!quiz) return;

        try {
            console.log({
                quizId: quiz.id,
                score: calculateScore(),
                totalQuestions: quiz.questions.length
            });

            const result = await api.submitQuizResult({
                quizId: quiz.id,
                score: calculateScore(),
                totalQuestions: quiz.questions.length
            });

            // Clear local storage
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            localStorage.removeItem(RELOAD_STORAGE_KEY);

            console.log(result?.id);
            navigate(`/results/${result?.id}`);
        } catch (error: any) {
            toast.error(error.message ? error.message : "Failed to submit quiz");
            console.error('Failed to submit quiz', error);
        }
    }, [quiz, navigate, calculateScore]);


    // Enter full-screen mode
    const enterFullScreen = () => {
        const containerElement = containerRef.current;
        if (containerElement?.requestFullscreen) {
            containerElement.requestFullscreen().catch(err => {
                console.error('Error entering fullscreen:', err);
            });
        }
    };

    // Handle unethical activities
    const handleUnethicalActivity = () => {
        setState(prev => {
            const newUnethicalCount = prev.unethicalActivitiesCount + 1;

            console.log("Unethical activity detected. Count:", newUnethicalCount);

            // Auto submit if unethical activities exceed 3
            if (newUnethicalCount >= 3) {
                submitQuiz();
            }

            return {
                ...prev,
                unethicalActivitiesCount: newUnethicalCount
            };
        });
    }

    // Answer selection handler
    const handleAnswerSelect = (answer: string | string[]) => {
        setState(prev => ({
            ...prev,
            selectedAnswers: {
                ...prev.selectedAnswers,
                [quiz!.questions[prev.currentQuestionIndex].id]: answer
            }
        }));
    };

    // Render question input based on type
    const renderQuestionInput = () => {
        if (!quiz) return null;

        const currentQuestion = quiz.questions[state.currentQuestionIndex];

        switch (currentQuestion.type) {
            case QuestionType.MULTIPLE_CHOICE:
                return currentQuestion.options && currentQuestion.options.map((option, index) => (
                    <div
                        key={index}
                        className='flex items-center justify-center gap-2 mb-2'
                    >
                        <div className="h-10 flex items-center justify-center w-[2%] bg-white border border-zinc-300 text-sm">
                            {index + 1}
                        </div>
                        <button
                            onClick={() => handleAnswerSelect(option)}
                            className={`w-full p-3 border h-10 text-left transition-colors duration-200 ${state.selectedAnswers[currentQuestion.id] === option
                                ? 'bg-blue-500 text-white'
                                : 'hover:bg-gray-100 text-black'
                                }`}
                        >
                            {option}
                        </button>
                    </div>
                ));

            case QuestionType.TRUE_FALSE:
                return (
                    <>
                        <button
                            onClick={() => handleAnswerSelect('true')}
                            className={`w-full p-3 mb-2 text-black border rounded transition-colors duration-200 
                            ${state.selectedAnswers[currentQuestion.id] === 'true'
                                    ? 'bg-blue-500 text-white'
                                    : 'hover:bg-gray-100'}`}
                        >
                            True
                        </button>
                        <button
                            onClick={() => handleAnswerSelect('false')}
                            className={`w-full p-3 mb-2 text-black border rounded transition-colors duration-200 
                            ${state.selectedAnswers[currentQuestion.id] === 'false'
                                    ? 'bg-blue-500 text-white'
                                    : 'hover:bg-gray-100'}`}
                        >
                            False
                        </button>
                    </>
                );

            case QuestionType.MULTI_ANSWER:
                return currentQuestion.options && currentQuestion.options.map((option, index) => (
                    <div key={index} className='flex items-center gap-2 mb-2'>
                        <input
                            type="checkbox"
                            id={`option-${index}`}
                            checked={(state.selectedAnswers[currentQuestion.id] as string[] || []).includes(option)}
                            onChange={() => {
                                const currentSelected = (state.selectedAnswers[currentQuestion.id] as string[]) || [];
                                const newSelected = currentSelected.includes(option)
                                    ? currentSelected.filter(ans => ans !== option)
                                    : [...currentSelected, option];
                                handleAnswerSelect(newSelected);
                            }}
                            className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <label htmlFor={`option-${index}`} className="ml-2">{option}</label>
                    </div>
                ));

            case QuestionType.FILL_IN_BLANK:
                return (
                    <input
                        type="text"
                        placeholder="Type your answer here"
                        value={(state.selectedAnswers[currentQuestion.id] as string) || ''}
                        onChange={(e) => handleAnswerSelect(e.target.value)}
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                );
        }
    };

    // If quiz is not loaded, show loader
    if (!quiz) return <Loader />;

    // Check quiz availability and attempt limits
    if (!quiz.isAvailable) {
        toast.error("The quiz is not available at the moment.");
        return <Navigate to={"/quizzes"} />;
    }

    // Question navigation modal
    const QuestionNavigationModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-3/4 max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Navigate Questions</h2>
                <div className="grid grid-cols-5 gap-2">
                    {quiz.questions.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setState(prev => ({
                                    ...prev,
                                    currentQuestionIndex: index
                                }));
                                setQuestionModalOpen(false);
                            }}
                            className={`p-2 rounded ${state.currentQuestionIndex === index
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-200 text-black'
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setQuestionModalOpen(false)}
                    className="mt-4 w-full bg-gray-500 text-white p-2 rounded"
                >
                    Close
                </button>
            </div>
        </div>
    );

    // Main render
    return (
        <div id='outerDiv' ref={containerRef} className="py-6 px-4 md:px-20 bg-white h-screen relative">
            {/* Full-screen exit warning */}
            {!isFullScreen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                        <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                        <h2 className="text-xl font-bold mb-2">Full-Screen Mode Required</h2>
                        <p className="mb-4">Exiting full-screen mode is not allowed during the exam.</p>
                        <button
                            onClick={enterFullScreen}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Return to Full-Screen
                        </button>
                    </div>
                </div>
            )}

            {/* Question Navigation Modal */}
            {questionModalOpen && <QuestionNavigationModal />}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold truncate">{quiz.title}</h2>

                {/* Timer and Navigation */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <Timer className="mr-2" />
                        <span className="font-bold">{Math.floor(state.timeRemaining / 60)}:{(state.timeRemaining % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <button
                        onClick={() => setQuestionModalOpen(true)}
                        className="bg-blue-300 p-2 rounded hover:bg-gray-400"
                    >
                        Navigate Questions
                    </button>
                </div>
            </div>

            {/* Question Display */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                    Question {state.currentQuestionIndex + 1} of {quiz.questions.length}
                </h3>
                <p className="mb-4">{quiz.questions[state.currentQuestionIndex].text}</p>
                {renderQuestionInput()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <button
                    onClick={() => {
                        if (state.currentQuestionIndex > 0) {
                            setState(prev => ({
                                ...prev,
                                currentQuestionIndex: prev.currentQuestionIndex - 1
                            }));
                        }
                    }}
                    className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
                    disabled={state.currentQuestionIndex === 0}
                >
                    <ChevronLeft className="mr-2" />
                    Previous
                </button>
                <button
                    onClick={() => {
                        if (state.currentQuestionIndex < quiz.questions.length - 1) {
                            setState(prev => ({
                                ...prev,
                                currentQuestionIndex: prev.currentQuestionIndex + 1
                            }));
                        } else {
                            submitQuiz(); // Submit if it's the last question
                        }
                    }}
                    className="bg-blue-500 text-white p-2 rounded"
                >
                    {state.currentQuestionIndex < quiz.questions.length - 1 ? (
                        <>
                            Next
                            <ChevronRight className="ml-2" />
                        </>
                    ) : (
                        "Submit"
                    )}
                </button>
            </div>
        </div>
    );
};

export default QuizAttempt;