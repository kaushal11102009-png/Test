import { openDB, type DBSchema } from 'idb';
import type { ParsedQuestion } from './parser';

export type SavedAttempt = {
  id: string;
  testId: string;
  studentName: string;
  answers: Record<string, number>;
  score: number;
  total: number;
  submittedAt: string;
};

type MissionTestDB = DBSchema & {
  tests: {
    key: string;
    value: { id: string; title: string; questions: ParsedQuestion[]; durationMinutes: number; locked: boolean; createdAt: string; updatedAt: string };
    indexes: { 'by-updated': string };
  };
  attempts: {
    key: string;
    value: SavedAttempt;
    indexes: { 'by-test': string; 'by-submitted': string };
  };
};

const database = openDB<MissionTestDB>('mission-test', 1, {
  upgrade(db) {
    const tests = db.createObjectStore('tests', { keyPath: 'id' });
    tests.createIndex('by-updated', 'updatedAt');
    const attempts = db.createObjectStore('attempts', { keyPath: 'id' });
    attempts.createIndex('by-test', 'testId');
    attempts.createIndex('by-submitted', 'submittedAt');
  },
});

export const saveTest = async (test: MissionTestDB['tests']['value']) => (await database).put('tests', test);
export const getTest = async (id: string) => (await database).get('tests', id);
export const listTests = async () => (await database).getAllFromIndex('tests', 'by-updated');
export const deleteTest = async (id: string) => (await database).delete('tests', id);
export const saveAttempt = async (attempt: SavedAttempt) => (await database).put('attempts', attempt);
export const listAttemptsForTest = async (testId: string) => (await database).getAllFromIndex('attempts', 'by-test', testId);
