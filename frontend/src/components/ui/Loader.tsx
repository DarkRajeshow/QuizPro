const Loader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-b-transparent border-blue-500 border-solid mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">{message}</p>
        </div>
    );
};

export default Loader;