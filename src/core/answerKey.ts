export const makeAnswerKey = (questions: Array<{ id: string; correctIndex: number | null }>) => {
  const answerKey: Record<string, number> = {};
  for (const question of questions) {
    if (question.correctIndex !== null && question.correctIndex !== undefined) {
      answerKey[question.id] = question.correctIndex;
    }
  }
  return answerKey;
};
