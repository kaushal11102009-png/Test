import { useEffect, useMemo, useState } from 'react';
import { getAllTests, saveAttempt, saveTest } from './db';
import { parseQuestionsFromText } from './core/parser';
import { scoreAttempt } from './core/scoring';
import { generateResultCode } from './core/resultCode';
import { AttemptRecord, Question, TestRecord } from './types';

const emptyQuestion = (): Question => ({
  id: crypto.randomUUID(),
  prompt: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  source: 'manual',
});

const blankTest = (): TestRecord => ({
  id: crypto.randomUUID(),
  title: 'Untitled Test',
  language: 'en',
  timeLimitMinutes: 30,
  questions: [emptyQuestion()],
  answerKey: {},
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

function App() {
  const [mode, setMode] = useState<'teacher' | 'student'>('teacher');
  const [draft, setDraft] = useState<TestRecord>(blankTest());
  const [savedTests, setSavedTests] = useState<TestRecord[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [studentName, setStudentName] = useState('');
  const [studentAnswers, setStudentAnswers] = useState<Record<string, number>>({});
  const [rawInput, setRawInput] = useState('');
  const [result, setResult] = useState<{ score: number; total: number; code: string } | null>(null);

  const refreshTests = async () => {
    const tests = await getAllTests();
    setSavedTests(tests);
    if (tests.length > 0 && !selectedTestId) {
      setSelectedTestId(tests[0].id);
      setDraft(tests[0]);
    }
  };

  useEffect(() => {
    void refreshTests();
  }, []);

  const addQuestion = () => {
    setDraft((current) => ({
      ...current,
      questions: [...current.questions, emptyQuestion()],
      updatedAt: Date.now(),
    }));
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | number | string[]) => {
    setDraft((current) => {
      const next = [...current.questions];
      next[index] = {
        ...next[index],
        [field]: value,
      } as Question;
      return { ...current, questions: next, updatedAt: Date.now() };
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setDraft((current) => {
      const nextQuestions = [...current.questions];
      const options = [...(nextQuestions[questionIndex]?.options ?? [])];
      options[optionIndex] = value;
      nextQuestions[questionIndex] = {
        ...nextQuestions[questionIndex],
        options,
      };
      return { ...current, questions: nextQuestions, updatedAt: Date.now() };
    });
  };

  const importText = () => {
    const parsed = parseQuestionsFromText(rawInput);
    if (!parsed.length) return;
    setDraft((current) => ({
      ...current,
      questions: parsed,
      updatedAt: Date.now(),
    }));
  };

  const saveDraft = async () => {
    const finalDraft = {
      ...draft,
      answerKey: Object.fromEntries(draft.questions.map((q) => [q.id, q.correctIndex])),
      updatedAt: Date.now(),
    };
    await saveTest(finalDraft);
    await refreshTests();
    setSelectedTestId(finalDraft.id);
  };

  const submitExam = async () => {
    const selected = savedTests.find((test) => test.id === selectedTestId) ?? draft;
    const score = scoreAttempt(selected.questions, studentAnswers, selected.answerKey || {});
    const code = generateResultCode(score.score, score.total, studentName || 'student');
    const attemptRecord: AttemptRecord = {
      id: crypto.randomUUID(),
      testId: selected.id,
      studentName: studentName || 'Student',
      answers: studentAnswers,
      score,
      code,
      createdAt: Date.now(),
    };
    await saveAttempt(attemptRecord);
    setResult({ score: score.score, total: score.total, code });
  };

  const summaryText = useMemo(
    () => `${draft.questions.length} questions · ${draft.questions.filter((q) => q.prompt.trim()).length} ready`,
    [draft.questions]
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Mission Test</p>
          <h1>Teacher + Student Workflow</h1>
        </div>
        <div className="segmented">
          <button className={mode === 'teacher' ? 'active' : ''} onClick={() => setMode('teacher')}>
            Teacher
          </button>
          <button className={mode === 'student' ? 'active' : ''} onClick={() => setMode('student')}>
            Student
          </button>
        </div>
      </header>

      {mode === 'teacher' ? (
        <main className="layout two-col">
          <section className="panel">
            <h2>New Test Wizard</h2>
            <label>
              Test title
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </label>

            <label>
              Time limit (minutes)
              <input
                type="number"
                value={draft.timeLimitMinutes}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, timeLimitMinutes: Number(event.target.value) || 30 }))
                }
              />
            </label>

            <div className="section-block">
              <h3>Import text</h3>
              <textarea
                rows={6}
                value={rawInput}
                onChange={(event) => setRawInput(event.target.value)}
                placeholder="Q1: 2 + 2 = ?\nA. 3\nB. 4\nC. 5\nD. 6"
              />
              <div className="inline-actions">
                <button onClick={importText}>Parse questions</button>
                <button className="secondary" onClick={addQuestion}>Add blank question</button>
              </div>
            </div>

            <div className="summary-row">
              <span>{summaryText}</span>
              <button onClick={saveDraft}>Save draft</button>
            </div>

            {draft.questions.map((question, index) => (
              <div className="question-card" key={question.id}>
                <div className="question-header">
                  <strong>Question {index + 1}</strong>
                  <select
                    value={question.correctIndex}
                    onChange={(event) => updateQuestion(index, 'correctIndex', Number(event.target.value))}
                  >
                    {question.options.map((_, optionIndex) => (
                      <option key={optionIndex} value={optionIndex}>Correct option {optionIndex + 1}</option>
                    ))}
                  </select>
                </div>

                <textarea
                  rows={3}
                  value={question.prompt}
                  onChange={(event) => updateQuestion(index, 'prompt', event.target.value)}
                  placeholder="Question text"
                />

                <div className="options-grid">
                  {question.options.map((option, optionIndex) => (
                    <input
                      key={`${question.id}-option-${optionIndex}`}
                      value={option}
                      onChange={(event) => updateOption(index, optionIndex, event.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>

          <aside className="panel">
            <h2>Saved tests</h2>
            {savedTests.length === 0 ? (
              <p className="empty-state">No tests saved yet.</p>
            ) : (
              <ul className="test-list">
                {savedTests.map((test) => (
                  <li key={test.id}>
                    <button
                      className={selectedTestId === test.id ? 'active' : ''}
                      onClick={() => {
                        setSelectedTestId(test.id);
                        setDraft(test);
                      }}
                    >
                      {test.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="section-block">
              <h3>Feature status</h3>
              <p>Teacher workflow: available</p>
              <p>Student flow: available</p>
              <p>Persistence: IndexedDB via Dexie</p>
            </div>
          </aside>
        </main>
      ) : (
        <main className="layout single-col">
          <section className="panel student-panel">
            <h2>Student exam</h2>
            <label>
              Test
              <select
                value={selectedTestId}
                onChange={(event) => {
                  const id = event.target.value;
                  const selected = savedTests.find((test) => test.id === id);
                  setSelectedTestId(id);
                  if (selected) {
                    setDraft(selected);
                  }
                }}
              >
                <option value="">Select a test</option>
                {savedTests.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Student name
              <input
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="Enter your name"
              />
            </label>

            {draft.questions.map((question, index) => (
              <div className="question-card" key={question.id}>
                <p className="question-label">Question {index + 1}</p>
                <p>{question.prompt || 'Question text pending'}</p>
                <div className="options-stack">
                  {question.options.map((option, optionIndex) => (
                    <label key={`${question.id}-${optionIndex}`} className="option-row">
                      <input
                        type="radio"
                        name={question.id}
                        checked={studentAnswers[question.id] === optionIndex}
                        onChange={() =>
                          setStudentAnswers((current) => ({
                            ...current,
                            [question.id]: optionIndex,
                          }))
                        }
                      />
                      <span>{option || `Option ${optionIndex + 1}`}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="inline-actions">
              <button onClick={submitExam}>Submit exam</button>
            </div>

            {result && (
              <div className="result-box">
                <h3>Result</h3>
                <p>
                  Score: {result.score} / {result.total}
                </p>
                <p>Result code: {result.code}</p>
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
