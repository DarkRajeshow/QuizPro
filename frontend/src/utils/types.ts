export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string,
  role: UserRole;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  createdBy: User | string;
  questions: Question[];
  duration: number;
}

export interface Question {
  id: string;
  quizId: string;
  type: QuestionType;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface Result {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

export interface QuizAttemptState {
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string>;
  timeRemaining: number;
}