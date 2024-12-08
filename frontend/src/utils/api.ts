import { User, Quiz, Attempt } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  async request(endpoint: string, method: string = 'GET', body?: any) {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const config: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }

    return response.json();
  },

  // Authentication
  async login(formData: { email: string, password: string }) {
    return this.request('/users/login', 'POST', formData);
  },

  async register(userData: Partial<User>) {
    return this.request('/users/register', 'POST', userData);
  },

  // Quiz Operations
  async createQuiz(quizData: Partial<Quiz>) {
    return this.request('/quizzes', 'POST', quizData);
  },

  async getQuizzes() {
    return this.request('/quizzes');
  },

  async getPopularQuizzes() {
    return this.request('/quizzes/popular');
  },

  async getUserQuizzes() {
    return this.request('/quizzes/user');
  },

  async getQuizById(quizId: string) {
    return this.request(`/quizzes/${quizId}`);
  },

  async getResultById(resultId: string) {
    return this.request(`/results/${resultId}`);
  },

  async getUserAttempts() {
    return this.request(`/results/`);
  },

  async getQuizResults(quizId: string) {
    return this.request(`/results/quiz/${quizId}`);
  },

  async getUserResults() {
    return this.request(`/results`);
  },

  // Quiz Attempt
  async submitQuizResult(resultData: Partial<Attempt>) {
    return this.request('/results/submit', 'POST', resultData);
  },

  async getAdminData() {
    return this.request(`/admin`);
  },
};


