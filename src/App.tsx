import { useEffect, useMemo, useState } from 'react';
import { parseQuestionsFromText, type ParsedQuestion } from './core/parser';
import { scoreAttempt } from './core/scoring';

const exampleText = `Q1: 2 + 2 = ?\nA. 3\nB. 4\nC. 5\nD. 6\nAnswer: B\n\nQ2: Capital of India?\nA. Delhi\nB. Mumbai\nC. Kolkata\nD. Jaipur\nAnswer: A`;
const storageKey = 'mission-test-question-set-v2';
const readSavedQuestions = (): ParsedQuestion[] => {
  try {
    const value = localStorage.getItem(storageKey);
    return value ? JSON.parse(value) as ParsedQuestion[] : parseQuestionsFromText(exampleText);
  } catch {
    return parseQuestionsFromText(exampleText);
  }
};

export default function App() {
  const [questions, setQuestions] = useState<ParsedQuestion[]>(readSavedQuestions);
  const [draft, setDraft] = useState(exampleText);
  const [mode, setMode] = useState<'teacher' | 'student'>('teacher');
  const [locked, setLocked] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; total: number; questionCount: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(questions));
  }, [questions]);

  const gradableCount = useMemo(() => questions.filter((question) => question.correctIndex !== null).length, [questions]);

  const importQuestions = () => {
    const parsed = parseQuestionsFromText(draft);
    if (!parsed.length) {
      setError('No questions found. Use Q1: question text followed by A-D options.');
      return;
    }
    setQuestions(parsed);
    setAnswers({});
    setResult(null);
    setError('');
  };

  const updateQuestion = (id: string, patch: Partial<ParsedQuestion>) => {
    setQuestions((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const submitAttempt = () => {
    if (!studentName.trim()) {
      setError('Enter your name before submitting.');
      return;
    }
    if (!gradableCount) {
      setError('This test has no answer key yet. Ask the teacher to set correct answers.');
      return;
    }
    setResult(scoreAttempt(questions, answers, Object.fromEntries(questions.map((question) => [question.id, question.correctIndex ?? undefined]))));
    setError('');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div><p className="eyebrow">Mission Test · Demo</p><h1>Test creation and practice</h1></div>
        <nav className="mode-switch" aria-label="Choose app view">
          <button className={mode === 'teacher' ? 'active' : ''} onClick={() => { setMode('teacher'); setError(''); }}>Teacher</button>
          <button className={mode === 'student' ? 'active' : ''} onClick={() => { setMode('student'); setError(''); }}>Student</button>
        </nav>
      </header>

      {mode === 'teacher' ? (
        <main className="teacher-layout">
          <section className="panel">
            <div className="panel-heading"><div><p className="eyebrow">Step 1</p><h2>Import questions</h2></div><span className="badge">Paste text</span></div>
            <p className="muted">Format: Q1: prompt, A-D choices, and optional <code>Answer: B</code>. Correct answers are not guessed.</p>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={13} aria-label="Question text" placeholder="Paste questions here…" />
            <button onClick={importQuestions}>Import / replace questions</button>
            {error && <p className="error" role="alert">{error}</p>}
          </section>

          <section className="panel">
            <div className="panel-heading"><div><p className="eyebrow">Step 2</p><h2>Review and set answer key</h2></div><span className="badge">{questions.length} questions</span></div>
            <p className="muted">Set the correct answer for each item. Locking is only a local demo control; it does not secure answers on a shared device.</p>
            <div className="question-preview">
              {questions.map((question, index) => (
                <article key={question.id} className="question-card">
                  <label className="field-label">Question {index + 1}<input value={question.prompt} disabled={locked} onChange={(event) => updateQuestion(question.id, { prompt: event.target.value })} /></label>
                  <div className="choice-editor">
                    {question.options.map((option, optionIndex) => (
                      <div className="choice-edit" key={`${question.id}-${optionIndex}`}>
                        <label className="answer-radio" title="Mark correct answer"><input type="radio" name={`key-${question.id}`} checked={question.correctIndex === optionIndex} disabled={locked || !option.trim()} onChange={() => updateQuestion(question.id, { correctIndex: optionIndex })} />{String.fromCharCode(65 + optionIndex)}</label>
                        <input aria-label={`Question ${index + 1}, option ${String.fromCharCode(65 + optionIndex)}`} value={option} disabled={locked} onChange={(event) => { const options = [...question.options]; options[optionIndex] = event.target.value; updateQuestion(question.id, { options }); }} />
                      </div>
                    ))}
                  </div>
                  <p className="muted small">{question.correctIndex === null ? 'Answer key not set' : `Correct answer: ${String.fromCharCode(65 + question.correctIndex)}`}</p>
                </article>
              ))}
              {!questions.length && <p className="muted">Import questions to begin.</p>}
            </div>
            <div className="button-row"><button className="secondary" onClick={() => { setLocked((value) => !value); }}>{locked ? 'Unlock for editing' : 'Lock editing'}</button><button onClick={() => { setMode('student'); setAnswers({}); setResult(null); }}>Preview student view</button></div>
          </section>
        </main>
      ) : (
        <main className="student-layout">
          <section className="panel exam-panel">
            <div className="panel-heading"><div><p className="eyebrow">Student practice</p><h2>Answer the questions</h2></div><span className="badge">{questions.length} questions</span></div>
            <label className="field-label">Your name<input value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Enter your name" disabled={!!result} /></label>
            {questions.map((question, index) => (
              <article key={question.id} className="student-question">
                <p className="question-number">Question {index + 1}</p><h3>{question.prompt || 'Untitled question'}</h3>
                {question.options.filter((option) => option.trim()).map((option, optionIndex) => (
                  <label key={`${question.id}-${optionIndex}`} className="option-row"><input type="radio" name={question.id} checked={answers[question.id] === optionIndex} disabled={!!result} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} /><span><b>{String.fromCharCode(65 + optionIndex)}.</b> {option}</span></label>
                ))}
              </article>
            ))}
            {error && <p className="error" role="alert">{error}</p>}
            {!result ? <button onClick={submitAttempt}>Submit attempt</button> : <div className="result-box"><p className="eyebrow">Result · {studentName.trim()}</p><strong>Score: {result.score} / {result.total}</strong><p className="muted">Graded questions: {result.total} of {result.questionCount}</p></div>}
            <p className="muted small">Practice flow only. This single-device demo stores the answer key locally and is not suitable for secure examinations.</p>
          </section>
        </main>
      )}
      <footer className="footer">Mission Test · Local prototype · Changes are saved on this browser</footer>
    </div>
  );
}
