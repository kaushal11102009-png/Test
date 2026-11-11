import type { Question, TestRecord } from '../types';

export type TestSharePayload = {
  id: string;
  title: string;
  description: string;
  language: 'en' | 'hi';
  durationMinutes: number;
  questions: Question[];
};

/** Produce student-facing question data. Private answer keys and teacher metadata are omitted. */
export const toPublicTest = (test: TestRecord): TestSharePayload => ({
  id: test.id,
  title: test.title,
  description: test.description,
  language: test.language,
  durationMinutes: test.durationMinutes,
  questions: test.questions.map(({ id, prompt, options, source }) => ({ id, prompt, options: [...options], source })),
});

export const validatePublicTest = (value: unknown): value is TestSharePayload => {
  if (!value || typeof value !== 'object') return false;
  const test = value as Partial<TestSharePayload>;
  return typeof test.id === 'string'
    && typeof test.title === 'string'
    && typeof test.description === 'string'
    && (test.language === 'en' || test.language === 'hi')
    && typeof test.durationMinutes === 'number'
    && Number.isFinite(test.durationMinutes)
    && test.durationMinutes > 0
    && Array.isArray(test.questions)
    && test.questions.every((question) => question !== null
      && typeof question === 'object'
      && typeof question.id === 'string'
      && typeof question.prompt === 'string'
      && Array.isArray(question.options)
      && question.options.every((option) => typeof option === 'string'));
};
