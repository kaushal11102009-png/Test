import { describe, expect, it } from 'vitest';
import { parseQuestionsFromText } from '../src/core/parser';
import { scoreAttempt } from '../src/core/scoring';

describe('question text parser', () => {
  it('parses numbered questions and options without guessing the answer key', () => {
    const questions = parseQuestionsFromText('Q1: 2 + 2 = ?\nA. 3\nB. 4\nC. 5\nD. 6');
    expect(questions).toHaveLength(1);
    expect(questions[0].prompt).toBe('2 + 2 = ?');
    expect(questions[0].options).toEqual(['3', '4', '5', '6']);
    expect(questions[0].correctIndex).toBeNull();
  });

  it('reads an explicitly marked answer', () => {
    const [question] = parseQuestionsFromText('1. Choose B\nA. first\nB. second\nAnswer: B');
    expect(question.correctIndex).toBe(1);
  });

  it('handles a question with no numbering', () => {
    const [question] = parseQuestionsFromText('Capital of India?\nA) Delhi\nB) Mumbai');
    expect(question.prompt).toBe('Capital of India?');
    expect(question.options[0]).toBe('Delhi');
    expect(question.options[1]).toBe('Mumbai');
  });
});

describe('attempt scoring', () => {
  it('scores only questions with an answer key', () => {
    const questions = [{ id: 'one' }, { id: 'two' }];
    expect(scoreAttempt(questions, { one: 1, two: 0 }, { one: 1 })).toEqual({ score: 1, total: 1, questionCount: 2 });
  });
});
