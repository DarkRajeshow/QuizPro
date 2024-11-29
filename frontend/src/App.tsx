import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
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
  logout: () => { }
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

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      logout
    }}>
      <Router>
        <Toaster duration={1500} richColors />
        <div className="w-screen">
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={<HomePage />}
            />
            <Route
              path="/login"
              element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                isAuthenticated && user?.role === 'ADMIN' ?
                  <AdminPage /> :
                  <Navigate to="/login" />
              }
            />


            {/* User Routes */}
            <Route
              path="/user"
              element={
                isAuthenticated ?
                  <UserPage /> :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/quizzes/:quizId"
              element={
                isAuthenticated ?
                  <QuizAttempt /> :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/results/:resultId"
              element={
                isAuthenticated ?
                  <ResultPage /> :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/quiz-results/:quizId"
              element={
                isAuthenticated ?
                  <QuizResultsPage /> :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/attempts"
              element={
                isAuthenticated ?
                  <MyAttemptsPage /> :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/quizzes"
              element={
                isAuthenticated ?
                  <QuizzesPage /> :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/quizzes/create"
              element={
                isAuthenticated ?
                  <QuizCreationForm /> :
                  <Navigate to="/login" />
              }
            />
            
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;