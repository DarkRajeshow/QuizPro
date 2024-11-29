import { Question } from "../../utils/types"


type QuestionCardProps = {
    question: Question;
    index: number;
    questionIndex: number;
    setQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
    removeQuestion: (index: number) => void
};


const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    index,
    questionIndex,
    setQuestionIndex,
    removeQuestion
}) => {


    return (
        <div className="flex items-center gap-1">
            <div className="h-20 flex items-center justify-center w-[8%] bg-white border border-zinc-300 text-sm">{index + 1}</div>
            <div className={`flex items-center justify-between border-2 px-2 py-2 h-20 bg-zinc-100 cursor-pointer font-normal w-[92%] relative ${questionIndex === index ? "border-black" : "border-zinc-200"}`} >
                <div onClick={() => setQuestionIndex(index)} className="w-[90%] flex flex-col gap-1 justify-start h-full">
                    <p className="text-xs">{question.type}</p>
                    <h1 className="capitalize text-sm">{question.text.length > 25 ? question.text.slice(0, 25) + "..." : question.text}</h1>
                </div>
                {index !== 0 && <svg onClick={() => removeQuestion(index)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 absolute top-2 right-2 w-[10%]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>}
            </div>
        </div>
    )
}

export default QuestionCard