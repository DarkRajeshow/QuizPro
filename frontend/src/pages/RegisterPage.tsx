import React, { useState, useContext, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';
import { AuthContext } from '../App';

const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userRole, setUserRole] = useState < 'QUIZ_TAKER' | 'QUIZ_MAKER' > ('QUIZ_TAKER');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState('');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!termsAccepted) {
            setError('Please accept the terms and conditions');
            return;
        }

        try {
            const userData = await api.register({
                name,
                email,
                password,
                role: userRole
            });

            login(userData);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Create Account
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Select User Role
                        </label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="QUIZ_TAKER"
                                    checked={userRole === 'QUIZ_TAKER'}
                                    onChange={() => setUserRole('QUIZ_TAKER')}
                                    className="form-radio"
                                />
                                <span className="ml-2">Quiz Taker</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="QUIZ_MAKER"
                                    checked={userRole === 'QUIZ_MAKER'}
                                    onChange={() => setUserRole('QUIZ_MAKER')}
                                    className="form-radio"
                                />
                                <span className="ml-2">Quiz Maker</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={() => setTermsAccepted(!termsAccepted)}
                            className="form-checkbox h-4 w-4 text-green-500"
                        />
                        <span className="text-sm">
                            I agree to the Terms and Conditions
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
                    >
                        <CheckCircle className="mr-2" />
                        Create Account
                    </button>
                </form>

                <div className="text-center mt-4">
                    <span>Already have an account? </span>
                    <button
                        onClick={() => navigate('/login')}
                        className="text-green-500 hover:underline"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;