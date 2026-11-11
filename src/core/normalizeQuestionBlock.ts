export const normalizeQuestionBlock = (block: string) => {
  const lines = block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  const prompt = lines[0].replace(/^(Q(?:uestion)?\s*\d*[:.-]?|\d+[.)]\s*)/i, '').trim();
  const options = lines.slice(1).map((line) => line.replace(/^[A-Da-d][.):-]\s*/i, '').trim());

  return {
    id: `q-${Math.random().toString(36).slice(2, 9)}`,
    prompt,
    options: options.slice(0, 4),
    correctIndex: 0,
    explanation: '',
    source: 'paste' as const,
  };
};
