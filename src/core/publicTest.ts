export type TestSharePayload = {
  id: string;
  title: string;
  questions: Array<{ id: string; prompt: string; options: string[] }>;
  durationMinutes: number;
  createdAt: string;
};

/** Student-facing share data intentionally omits correctIndex and explanation. */
export const toPublicTest = (test: { id: string; title: string; questions: Array<{ id: string; prompt: string; options: string[]; correctIndex?: number | null; explanation?: string }>; durationMinutes: number; createdAt: string }): TestSharePayload => ({
  id: test.id,
  title: test.title,
  questions: test.questions.map(({ id, prompt, options }) => ({ id, prompt, options: [...options] })),
  durationMinutes: test.durationMinutes,
  createdAt: test.createdAt,
});

export const validatePublicTest = (value: unknown): value is TestSharePayload => {
  if (!value || typeof value !== 'object') return false;
  const test = value as Partial<TestSharePayload>;
  return typeof test.id === 'string'
    && typeof test.title === 'string'
    && typeof test.durationMinutes === 'number'
    && Array.isArray(test.questions)
    && test.questions.every((question) => typeof question.id === 'string' && typeof question.prompt === 'string' && Array.isArray(question.options) && question.options.every((option) => typeof option === 'string'));
};
