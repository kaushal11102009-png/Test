import { openDB, type DBSchema } from 'idb';
import type { AttemptRecord, TestRecord } from '../types';

export type SavedAttempt = AttemptRecord;

type MissionTestDB = DBSchema & {
  tests: {
    key: string;
    value: TestRecord;
    indexes: { 'by-updated': number };
  };
  attempts: {
    key: string;
    value: SavedAttempt;
    indexes: { 'by-test': string; 'by-submitted': number };
  };
};

// A fresh, clean schema avoids silently loading the former demo sample question set.
const database = openDB<MissionTestDB>('mission-test-app', 1, {
  upgrade(db) {
    const tests = db.createObjectStore('tests', { keyPath: 'id' });
    tests.createIndex('by-updated', 'updatedAt');
    const attempts = db.createObjectStore('attempts', { keyPath: 'id' });
    attempts.createIndex('by-test', 'testId');
    attempts.createIndex('by-submitted', 'createdAt');
  },
});

export const saveTest = async (test: TestRecord): Promise<string> => (await database).put('tests', test);
export const getTest = async (id: string): Promise<TestRecord | undefined> => (await database).get('tests', id);
export const listTests = async (): Promise<TestRecord[]> => (await database).getAllFromIndex('tests', 'by-updated');
export const deleteTest = async (id: string): Promise<void> => { await (await database).delete('tests', id); };
export const saveAttempt = async (attempt: SavedAttempt): Promise<string> => (await database).put('attempts', attempt);
export const listAttemptsForTest = async (testId: string): Promise<SavedAttempt[]> => (await database).getAllFromIndex('attempts', 'by-test', testId);
