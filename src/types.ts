export type Question = {
  id: string;
  /** Keep exactly the text entered or pasted by the teacher. */
  prompt: string;
  /** Keep each option exactly as entered by the teacher. */
  options: string[];
  source: 'manual' | 'paste' | 'pdf' | 'ocr';
};

export type TestRecord = {
  id: string;
  title: string;
  description: string;
  language: 'en' | 'hi';
  durationMinutes: number;
  questions: Question[];
  /** Private teacher data; never include this field in a student payload. */
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
