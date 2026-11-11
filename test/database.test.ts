import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { deleteTest, getTest, listTests, saveTest } from '../src/core/database';
import type { TestRecord } from '../src/types';

const testRecord: TestRecord = {
  id: 'database-lifecycle-test', title: 'Lifecycle', description: 'test', language: 'en', durationMinutes: 10,
  questions: [], answerKey: {}, createdAt: 100, updatedAt: 100,
};

describe('database CRUD helpers', () => {
  it('creates/updates, retrieves, lists, and deletes a test record', async () => {
    expect(await getTest(testRecord.id)).toBeUndefined();
    await saveTest(testRecord);
    expect(await getTest(testRecord.id)).toEqual(testRecord);
    expect((await listTests()).some((test) => test.id === testRecord.id)).toBe(true);
    await deleteTest(testRecord.id);
    expect(await getTest(testRecord.id)).toBeUndefined();
  });
});
