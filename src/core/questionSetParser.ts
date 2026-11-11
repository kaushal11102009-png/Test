export const parseQuestionSet = (input: string) => {
  const blocks = input
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const prompt = lines[0] || `Question ${index + 1}`;
    const options = lines.slice(1).map((line) => line.replace(/^[A-Da-d][.):-]\s*/, '').trim());
    return {
      id: `q-${index + 1}`,
      prompt,
      options: options.slice(0, 4),
      correctIndex: 0,
      explanation: '',
      source: 'paste' as const,
    };
  });
};
