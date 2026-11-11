import { describe, expect, it } from 'vitest';
import { parseQuestionsFromText } from './src/core/parser';
import { scoreAttempt } from './src/core/scoring';

describe('Mission Test text parser', () => {
  it('creates questions and options from textual input', () => {
    const input = `Q1: 2 + 2 = ?\nA. 3\nB. 4\nC. 5\nD. 6`;
    const questions = parseQuestionsFromText(input);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].options.length).toBe(4);
    expect(questions[0].prompt).toContain('2 + 2');
  });
});

describe('Mission Test scoring', () => {
  it('awards one mark for correct teacher answers', () => {
    const questions = [
      { id: 'q1', prompt: '2 + 2 = ?', options: ['3', '4', '5', '6'], correctIndex: 1, explanation: '', source: 'manual' as const }
    ];
    const answers = { q1: 1 };
    const key = { q1: 1 };
    const result = scoreAttempt(questions, answers, key);
    expect(result.score).toBe(1);
    expect(result.total).toBe(1);
  });
});
