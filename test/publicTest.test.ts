import { describe, expect, it } from 'vitest';
import { toPublicTest, validatePublicTest } from '../src/core/publicTest';

describe('public test sharing', () => {
  it('strips answer keys and explanations from the student payload', () => {
    const publicTest = toPublicTest({ id: 't1', title: 'Math', durationMinutes: 20, createdAt: '2026-01-01', questions: [{ id: 'q1', prompt: '2+2?', options: ['3', '4'], correctIndex: 1, explanation: 'basic arithmetic' }] });
    expect(publicTest.questions[0]).not.toHaveProperty('correctIndex');
    expect(publicTest.questions[0]).not.toHaveProperty('explanation');
    expect(validatePublicTest(publicTest)).toBe(true);
  });

  it('rejects malformed student payloads', () => {
    expect(validatePublicTest({ id: 1, questions: 'bad' })).toBe(false);
  });
});
