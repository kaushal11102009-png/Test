import Dexie, { Table } from 'dexie';
import { AttemptRecord, TestRecord } from './types';

class MissionTestDB extends Dexie {
  tests!: Table<TestRecord, string>;
  attempts!: Table<AttemptRecord, string>;

  constructor() {
    super('mission-test-db');
    this.version(1).stores({
      tests: 'id, title, createdAt',
      attempts: 'id, testId, createdAt',
    });
  }
}

export const db = new MissionTestDB();

export const saveTest = async (test: TestRecord) => {
  await db.tests.put(test);
};

export const getAllTests = async () => {
  return db.tests.orderBy('createdAt').reverse().toArray();
};

export const saveAttempt = async (attempt: AttemptRecord) => {
  await db.attempts.put(attempt);
};

export const getAllAttempts = async () => {
  return db.attempts.orderBy('createdAt').reverse().toArray();
};
