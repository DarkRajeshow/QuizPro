import React, { useState } from 'react';
import { api } from '../../utils/api';
import { QuestionType, Question } from '../../utils/types';
import SingleQuestion from './SingleQuestion';
import QuestionCard from './QuestionCard';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const QuizCreationForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(10)
    const [questions, setQuestions] = useState<Partial<Question>[]>([{
        type: QuestionType.MULTIPLE_CHOICE,
        text: '',
        options: ['', '', '', ''],
        correctAnswer: ''
    }]);
    const [questionIndex, setQuestionIndex] = useState(0);
    const navigate = useNavigate()


    const addQuestion = () => {
        setQuestionIndex(questions.length)
        setQuestions([...questions, {
            type: QuestionType.MULTIPLE_CHOICE,
            text: '',
            options: ['', '', '', ''],
            correctAnswer: '',
        }]);
    };

    const updateQuestion = (index: number, updates: Partial<Question>) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], ...updates };
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log(questions);


        const invalidQuestion = questions.find((q: any) => {
            return !q.type || !q.text || !Array.isArray(q.options) || q.options.length === 0 || !q.correctAnswer;
        });

        if (invalidQuestion) {
            toast.error("All questions must have type, text, options, and correctAnswer.")
            return;
        }

        try {
            await api.createQuiz({
                title,
                description,
                questions: questions as Question[],
                duration
            });

            toast.success("Quiz created successfully.")
            navigate("/")

        } catch (error) {
            alert('Failed to create quiz');
        }
    };


    const removeQuestion = (index: number) => {

        if (index === questionIndex) {
            setQuestionIndex(0)
        }
        else if (questionIndex > index) {
            setQuestionIndex((pre) => pre - 1)
        }
        let tempquestions = [...questions]
        tempquestions.splice(index, 1);

        setQuestions(tempquestions);
    }

    return (
        <div className="bg-white rounded">
            <div className='grid grid-cols-5'>
                <div className='bg-[#F6F6F6]/50 p-3 border-zinc-200 border overflow-y-auto h-[91vh]'>
                    <h1 className='pb-3 text-lg'>Questions ({questions.length})</h1>
                    <div className='flex gap-2 flex-col'>
                        {questions.map((question, index) => (
                            <QuestionCard key={index} removeQuestion={removeQuestion} setQuestionIndex={setQuestionIndex} question={question as Question} questionIndex={questionIndex} index={index} />
                        ))
                        }
                    </div>
                </div>
                <form onSubmit={handleSubmit} className='col-span-4 text-sm h-[91vh] p-4 border-zinc-200 border-l-none border'>
                    <div className='flex flex-col gap-2 h-[90%]'>
                        <div className="mb-2">
                            <label className="block mb-2">Quiz Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-2 border"
                                required
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 border"
                            />
                        </div>
                        {(questions && questions.length !== 0) && <SingleQuestion question={questions[questionIndex] as Question} updateQuestion={updateQuestion} index={questionIndex} />}
                    </div>


                    <div className='h-[10%] flex items-center justify-between gap-3 w-full'>
                        <div className='flex items-center gap-2 pr-2'>
                            <input value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} type="text" className='w-16 bg-zinc-100 focus:outline-none border-2 border-zinc-200' />
                            <p className=''>Min.</p>
                        </div>

                        <div className='flex items-center justify-center gap-3'>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="bg-blue-500 flex items-center justify-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Add Question
                            </button>
                            <button
                                type="submit"
                                className="bg-green-600"
                            >
                                Create Quiz
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuizCreationForm;