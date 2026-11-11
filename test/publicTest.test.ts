import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { deleteTest, getTest, listTests, saveTest } from '../src/core/database';
import { toPublicTest, validatePublicTest } from '../src/core/publicTest';
import type { TestRecord } from '../src/types';

const makeTest = (id: string): TestRecord => ({
  id,
  title: 'Math test',
  description: '',
  language: 'en',
  durationMinutes: 25,
  questions: [{ id: `${id}-q1`, prompt: '  Keep this text exactly?  ', options: ['A', 'B', '', ''], source: 'manual' }],
  answerKey: { [`${id}-q1`]: 1 },
  createdAt: 1,
  updatedAt: 1,
});

describe('IndexedDB test persistence', () => {
  it('starts empty and supports create, read, list, update, and delete', async () => {
    const initial = await listTests();
    expect(initial).toEqual([]);
    const test = makeTest('db-test-a');
    await saveTest(test);
    expect(await getTest(test.id)).toEqual(test);
    expect((await listTests()).map((item) => item.id)).toContain(test.id);
    const updated = { ...test, title: 'Updated title', updatedAt: 2 };
    await saveTest(updated);
    expect((await getTest(test.id))?.title).toBe('Updated title');
    await deleteTest(test.id);
    expect(await getTest(test.id)).toBeUndefined();
  });
});

describe('student test package', () => {
  it('omits the answer key and preserves entered question/option strings verbatim', () => {
    const test = makeTest('public-test-a');
    const payload = toPublicTest(test);
    expect(payload).not.toHaveProperty('answerKey');
    expect(payload.questions[0]).not.toHaveProperty('correctIndex');
    expect(payload.questions[0].prompt).toBe('  Keep this text exactly?  ');
    expect(validatePublicTest(payload)).toBe(true);
  });

  it('rejects malformed student payloads', () => {
    expect(validatePublicTest({ id: 5, title: null, questions: 'bad' })).toBe(false);
  });
});
