import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import UserPage from './pages/UserPage';
import QuizAttempt from './components/user/QuizAttempt';
import QuizCreationForm from './components/admin/QuizCreationForm';
import { Toaster } from 'sonner';
import ResultPage from './pages/ResultPage';
import QuizzesPage from './pages/QuizzesPage';
import QuizResultsPage from './pages/QuizResultsPage';
import MyAttemptsPage from './pages/MyAttemptsPage';
import RegisterPage from './pages/RegisterPage';

// Authentication Context
export const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  user: any;
  login: (userData: any) => void;
  logout: () => void;
}>({
  isAuthenticated: false,
  user: null,
  login: () => { },
  logout: () => { },
});

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  const login = (userData: any) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Role-based route protection
  const ProtectedRoute = ({
    children,
    allowedRoles,
  }: {
    children: JSX.Element;
    allowedRoles: string[];
  }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    if (!allowedRoles.includes(user?.role)) {
      return <Navigate to="/" />; // Redirect to home or any other page
    }
    return children;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      <Router>
        <Toaster duration={1500} richColors />
        <div className="w-screen">
          {/* Conditionally Render Navbar */}
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
            />
            <Route
              path="/register"
              element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />}
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/user"
              element={
                <ProtectedRoute
                  allowedRoles={['ADMIN', 'QUIZ_TAKER', 'QUIZ_MAKER']}
                >
                  <UserPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/take-quiz/:quizId"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'QUIZ_TAKER', 'QUIZ_MAKER']}>
                  <QuizAttempt />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:resultId"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'QUIZ_TAKER', 'QUIZ_MAKER']}>
                  <ResultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz-results/:quizId"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'QUIZ_MAKER']}>
                  <QuizResultsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attempts"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'QUIZ_TAKER', 'QUIZ_MAKER']}>
                  <MyAttemptsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes"
              element={
                <ProtectedRoute
                  allowedRoles={['ADMIN', 'QUIZ_TAKER', 'QUIZ_MAKER']}
                >
                  <QuizzesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes/create"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'QUIZ_MAKER']}>
                  <QuizCreationForm />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
