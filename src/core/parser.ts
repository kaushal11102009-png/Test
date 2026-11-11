const lineRegex = /^(?:Q(?:uestion)?\s*\d*[:.-]?|\d+[.)]\s*)?(.*)$/i;

export const parseQuestionsFromText = (raw: string) => {
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];

  const questions: Array<{ id: string; prompt: string; options: string[]; correctIndex: number; explanation: string; source: 'paste' }> = [];
  let current: Partial<{ id: string; prompt: string; options: string[]; correctIndex: number; explanation: string; source: 'paste' }> = {};

  for (const line of lines) {
    if (/^(Q|Question|\d+[.)])\b/i.test(line) || /^\d+\s*[:.-]/.test(line)) {
      if (current.prompt || current.options?.length) {
        questions.push({
          id: current.id ?? crypto.randomUUID(),
          prompt: current.prompt ?? 'Question',
          options: current.options && current.options.length ? current.options.slice(0, 4).concat(Array(Math.max(0, 4 - current.options.length)).fill('')) : ['', '', '', ''],
          correctIndex: current.correctIndex ?? 0,
          explanation: current.explanation ?? '',
          source: 'paste',
        });
      }

      current = {
        id: crypto.randomUUID(),
        prompt: line.replace(lineRegex, '$1').trim(),
        options: [],
        correctIndex: 0,
        explanation: '',
        source: 'paste',
      };
      continue;
    }

    if (/^[A-Da-d][.):-]/.test(line)) {
      const optionText = line.replace(/^[A-Da-d][.):-]\s*/, '').trim();
      current.options = [...(current.options ?? []), optionText];
      continue;
    }

    if (current.prompt) {
      current.prompt = `${current.prompt} ${line}`.trim();
    }
  }

  if (current.prompt || current.options?.length) {
    questions.push({
      id: current.id ?? crypto.randomUUID(),
      prompt: current.prompt ?? 'Question',
      options: current.options && current.options.length ? current.options.slice(0, 4).concat(Array(Math.max(0, 4 - current.options.length)).fill('')) : ['', '', '', ''],
      correctIndex: current.correctIndex ?? 0,
      explanation: current.explanation ?? '',
      source: 'paste',
    });
  }

  return questions;
};
