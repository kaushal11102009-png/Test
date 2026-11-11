export const scoreAttempt = (questions, answers, answerKey) => {
  let score = 0;
  for (const question of questions) {
    const chosen = answers[question.id];
    const correct = answerKey[question.id];
    if (chosen !== undefined && correct !== undefined && chosen === correct) {
      score += 1;
    }
  }
  return { score, total: questions.length };
};
