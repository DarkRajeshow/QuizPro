import React, { useState } from 'react';
import { Question, QuestionType } from '../../utils/types';


interface QuestionProps {
    question: Question;
    updateQuestion: (index: number, updatedQuestion: Partial<Question>) => void;
    index: number
}



const SingleQuestion: React.FC<QuestionProps> = ({ question, updateQuestion, index }) => {
    const [correctAnswer, setCorrectAnswer] = useState("");

    return (
        <div className="border p-4 mb-4 rounded">
            {/* Select Question Type */}

            <div className='flex items-center justify-between gap-2 pb-2'>
                <p className='flex items-center justify-center gap-1'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-blue-800">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                    </svg>
                    Question {index + 1}
                </p>
                <select
                    value={question.type}
                    onChange={(e) =>
                        updateQuestion(index, { type: e.target.value as QuestionType })
                    }
                    className="p-1 border"
                >
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="TRUE_FALSE">True/False</option>
                </select>
            </div>

            {/* Question Text */}
            <textarea
                placeholder="Question Text"
                value={question.text}
                onChange={(e) => updateQuestion(index, { text: e.target.value })}
                className="w-full h-20 p-2 mb-2"
            />

            {/* Multiple Choice Options */}
            {question.type === 'MULTIPLE_CHOICE' && (
                <div className='flex flex-col gap-1'>
                    {[0, 1, 2, 3].map((optIndex) => (
                        <div key={optIndex} className='flex items-center justify-center gap-3'>
                            <p onClick={() =>
                                updateQuestion(index, { correctAnswer: question.options?.[optIndex] })
                            } className={`border-2 border-zinc-00 h-5 w-5 rounded-full flex items-center justify-center cursor-pointer ${question.correctAnswer && question.correctAnswer === question.options?.[optIndex] && "bg-[#6366F2] border-black"}`}>
                                {(question.correctAnswer && question.correctAnswer === question.options?.[optIndex]) && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="size-3 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>}
                            </p>
                            <input
                                type="text"
                                placeholder={`Option ${optIndex + 1}`}
                                value={question.options?.[optIndex] || ''}
                                onChange={(e) => {
                                    const newOptions = [...(question.options || [])];
                                    newOptions[optIndex] = e.target.value;
                                    updateQuestion(index, { options: newOptions });
                                }}
                                className="w-full p-2"
                            />
                        </div>
                    ))}
                </div>
            )}
            {question.type === 'TRUE_FALSE' && (
                <div className='grid grid-cols-2 gap-3'>
                    {["true", "false"].map((option) => (
                        <div key={option} className='flex items-center justify-center gap-3'>
                            <p onClick={() =>
                                updateQuestion(index, { correctAnswer: option })
                            } className={`border-2 border-zinc-00 h-5 w-5 rounded-full flex items-center justify-center cursor-pointer ${question.correctAnswer && question.correctAnswer === option && "bg-[#6366F2] border-black"}`}>
                                {(question.correctAnswer && question.correctAnswer === option) && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="size-3 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>}
                            </p>
                            <p className="w-full p-2 bg-zinc-100 py-4 px-2 capitalize"
                            >{option}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SingleQuestion;
