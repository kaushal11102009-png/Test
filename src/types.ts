export type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: 'manual' | 'paste' | 'pdf' | 'ocr';
};

export type TestRecord = {
  id: string;
  title: string;
  language: 'en' | 'hi';
  timeLimitMinutes: number;
  questions: Question[];
  answerKey: Record<string, number>;
  createdAt: number;
  updatedAt: number;
};

export type AttemptRecord = {
  id: string;
  testId: string;
  studentName: string;
  answers: Record<string, number>;
  score: { score: number; total: number };
  code: string;
  createdAt: number;
};
