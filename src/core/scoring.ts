export type ScorableQuestion = { id: string };
export type AttemptAnswers = Record<string, number | undefined>;
export type AnswerKey = Record<string, number | undefined>;

export const scoreAttempt = <T extends ScorableQuestion>(
  questions: readonly T[],
  answers: AttemptAnswers,
  answerKey: AnswerKey
) => {
  let score = 0;
  let graded = 0;
  for (const question of questions) {
    const correct = answerKey[question.id];
    if (correct === undefined) continue;
    graded += 1;
    if (answers[question.id] === correct) score += 1;
  }
  return { score, total: graded, questionCount: questions.length };
};
