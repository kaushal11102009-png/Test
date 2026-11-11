export type ParsedQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number | null;
  explanation: string;
  source: 'paste';
};

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const questionStart = /^(?:Q(?:uestion)?\s*\d*\s*[:.)-]|\d+\s*[.)-])\s*/i;
const optionStart = /^([A-D])\s*[.):\-]\s*(.*)$/i;
const answerLine = /^(?:answer|correct answer|ans)\s*[:=-]\s*([A-D])\b/i;

/** Parse pasted multiple-choice questions. Correct answers are accepted only when explicitly marked. */
export const parseQuestionsFromText = (raw: string): ParsedQuestion[] => {
  const questions: ParsedQuestion[] = [];
  let current: ParsedQuestion | undefined;

  const finish = () => {
    if (!current) return;
    current.prompt = current.prompt.trim();
    current.options = current.options.slice(0, 4);
    while (current.options.length < 4) current.options.push('');
    if (current.prompt || current.options.some(Boolean)) questions.push(current);
    current = undefined;
  };

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const questionMatch = line.match(questionStart);
    if (questionMatch) {
      finish();
      current = { id: makeId(), prompt: line.slice(questionMatch[0].length).trim(), options: [], correctIndex: null, explanation: '', source: 'paste' };
      continue;
    }

    // Permit a question without a Q1/1. prefix, followed by labeled choices.
    const optionMatch = line.match(optionStart);
    if (optionMatch) {
      if (!current) current = { id: makeId(), prompt: '', options: [], correctIndex: null, explanation: '', source: 'paste' };
      const index = optionMatch[1].toUpperCase().charCodeAt(0) - 65;
      current.options[index] = optionMatch[2].trim();
      continue;
    }

    const answerMatch = line.match(answerLine);
    if (answerMatch && current) {
      current.correctIndex = answerMatch[1].toUpperCase().charCodeAt(0) - 65;
      continue;
    }

    if (!current) current = { id: makeId(), prompt: line, options: [], correctIndex: null, explanation: '', source: 'paste' };
    else if (!current.options.length) current.prompt = `${current.prompt} ${line}`.trim();
    else current.explanation = current.explanation ? `${current.explanation}\n${line}` : line;
  }
  finish();
  return questions;
};
