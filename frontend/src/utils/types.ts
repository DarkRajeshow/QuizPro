// export enum UserRole {
//   ADMIN = 'ADMIN',
//   QUIZ_TAKER = 'QUIZ_TAKER',
//   QUIZ_MAKER = 'QUIZ_MAKER',
// }

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_IN_BLANK = 'FILL_IN_BLANK',
  MULTI_ANSWER = 'MULTI_ANSWER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  createdBy: User | string; // Can be populated with a `User` object or just the `id` string
  questions: Question[];
  duration: number; // Duration in minutes
  startDate?: Date; // Optional start date
  expiryDate?: Date; // Optional expiry date
  maxAttempts: number; // Maximum attempts allowed
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  quizId: string;
  type: QuestionType;
  text: string;
  options: string[] | null; // Optional, needed only for MULTIPLE_CHOICE and MULTI_ANSWER
  correctAnswer: string[]; // Array to support multiple correct answers
  createdAt: Date;
  updatedAt: Date;
}

export interface Attempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number; // Tracks when the quiz was attempted
  attemptDate: Date; // Tracks when the quiz was attempted
}

export interface QuizAttemptState {
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string | string[]>; // To support multiple selected answers
  timeRemaining: number;
  unethicalActivitiesCount: number;
  reloadAttempts: number;
}
