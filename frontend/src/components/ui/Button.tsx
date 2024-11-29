import React from "react";

interface ButtonProps {
    text: string;
    className: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({ text, className, onClick }) => {
    return (
        <button onClick={onClick} className={`${className} text-white font-medium text-sm transition-all hover:outline px-4 py-2`}>
            {text}
        </button>
    );
};

export default Button;
