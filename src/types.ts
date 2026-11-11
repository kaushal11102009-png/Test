export type Question = {
  id: string;
  /** Text exactly as imported/edited by the teacher; never Unicode-normalized. */
  prompt: string;
  /** Preserve original option line text, including its visible marker when present. */
  options: string[];
  /** Null means the teacher has not supplied an answer. */
  correctIndex: number | null;
  /** Teacher-authored only; empty unless explicitly entered. */
  explanation: string;
  source: 'manual' | 'paste' | 'pdf' | 'ocr';
};

export type TestRecord = {
  id: string;
  title: string;
  language: 'en' | 'hi';
  timeLimitMinutes: number;
  questions: Question[];
  /** Only explicitly supplied teacher answers are stored here. */
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
