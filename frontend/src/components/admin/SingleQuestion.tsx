import React from 'react';
import { Question, QuestionType } from '../../utils/types';
import { CheckIcon } from 'lucide-react';

interface QuestionProps {
    question: Question;
    updateQuestion: (index: number, updatedQuestion: Partial<Question>) => void;
    index: number
}

const SingleQuestion: React.FC<QuestionProps> = ({ question, updateQuestion, index }) => {
    const renderQuestionTypeInputs = () => {
        switch (question.type) {
            case 'MULTIPLE_CHOICE':
                return renderMultipleChoiceInputs();
            case 'TRUE_FALSE':
                return renderTrueFalseInputs();
            case 'FILL_IN_BLANK':
                return renderFillInBlankInputs();
            case 'MULTI_ANSWER':
                return renderMultipleChoiceInputs();
            default:
                return null;
        }
    };

    const renderMultipleChoiceInputs = () => (
        <div className='flex flex-col gap-2'>
            {[0, 1, 2, 3].map((optIndex) => (
                <div key={optIndex} className='flex items-center gap-2'>
                    <button
                        type="button"
                        onClick={() => {
                            if (question.type === QuestionType.MULTIPLE_CHOICE) {
                                // For multiple-choice, allow only one correct answer
                                const selectedOption = question.options?.[optIndex] || '';
                                const newCorrectAnswer = selectedOption === question.correctAnswer?.[0] ? [] : [selectedOption];
                                updateQuestion(index, { correctAnswer: newCorrectAnswer });
                            } else if (question.type === QuestionType.MULTI_ANSWER) {
                                // For multiple-answer, toggle the selection
                                const currentCorrectAnswers = question.correctAnswer || [];
                                const selectedOption = question.options?.[optIndex] || '';
                                const newCorrectAnswers = currentCorrectAnswers.includes(selectedOption)
                                    ? currentCorrectAnswers.filter(ans => ans !== selectedOption)
                                    : [...currentCorrectAnswers, selectedOption];
                                updateQuestion(index, { correctAnswer: newCorrectAnswers });
                            }
                        }}
                        disabled={!question.options?.[optIndex]}
                        className={`h-5 p-0 w-5 rounded-full border-2 flex items-center justify-center 
                            ${question.correctAnswer?.includes(question.options?.[optIndex] || '')
                                ? 'bg-green-500 border-zinc-700'
                                : 'border-gray-300'}`}
                    >
                        {question.correctAnswer?.includes(question.options?.[optIndex] || '') && (
                            <CheckIcon className="h-3 w-3 text-white" />
                        )}
                    </button>
                    <input
                        type="text"
                        placeholder={`Option ${optIndex + 1}`}
                        value={question.options?.[optIndex] || ''}
                        onChange={(e) => {
                            const newOptions = [...(question.options || [])];
                            newOptions[optIndex] = e.target.value;
                            updateQuestion(index, { options: newOptions });
                        }}
                        className="flex-1 p-2 border-2"
                    />
                </div>
            ))}
        </div>
    );

    const renderTrueFalseInputs = () => (
        <div className='grid grid-cols-2 gap-3'>
            {["true", "false"].map((option) => (
                <div key={option} className='flex items-center gap-2'>
                    <button
                        type="button"
                        onClick={() => updateQuestion(index, { correctAnswer: [option] })}
                        className={`h-5 p-0 w-5 rounded-full border-2 flex items-center justify-center 
                            ${question.correctAnswer?.[0] === option
                                ? 'bg-green-500 border-zinc-700'
                                : 'border-gray-300'}`}
                    >
                        {question.correctAnswer?.[0] === option && (
                            <CheckIcon className="h-3 w-3 text-white" />
                        )}
                    </button>
                    <div className="flex-1 p-2 bg-gray-100 capitalize">
                        {option}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderFillInBlankInputs = () => (
        <div className='space-y-2'>
            <div className='flex items-center gap-2'>
                <input
                    type="text"
                    placeholder="Correct Answer"
                    value={question.correctAnswer?.[0] || ''}
                    onChange={(e) => updateQuestion(index, { correctAnswer: [e.target.value] })}
                    className="flex-1 p-2 border-2"
                />
            </div>
            <p className='text-sm text-gray-500'>
                For fill-in-blank questions, enter the exact answer expected.
            </p>
        </div>
    );


    return (
        <div className="border p-4 mb-4">
            <div className='flex items-center justify-between gap-2 pb-4'>
                <p className='flex items-center justify-center gap-1 font-medium'>

                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-blue-700">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                    </svg>
                    Question {index + 1}
                </p>
                <select
                    value={question.type}
                    onChange={(e) =>
                        updateQuestion(index, {
                            type: e.target.value as QuestionType,
                            // Reset options and correct answer when type changes
                            options: e.target.value === "FILL_IN_BLANK" ? null : e.target.value === "TRUE_FALSE" ? ["true", "false"] : ['', '', '', ''],
                            correctAnswer: []
                        })
                    }
                    className="p-2 border-2"
                >
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="TRUE_FALSE">True/False</option>
                    <option value="FILL_IN_BLANK">Fill in Blank</option>
                    <option value="MULTI_ANSWER">Multi Answer</option>
                </select>
            </div>

            <textarea
                placeholder="Question Text"
                value={question.text}
                onChange={(e) => updateQuestion(index, { text: e.target.value })}
                className="w-full h-20 p-2 mb-4 border-2"
            />

            {renderQuestionTypeInputs()}
        </div>
    );
};

export default SingleQuestion;