import { useCallback, useEffect, useState } from 'react';
import { deleteTest, getTest, listTests, saveTest } from './core/database';
import { toPublicTest } from './core/publicTest';
import type { Question, TestRecord } from './types';

const newId = () => globalThis.crypto?.randomUUID?.() ?? `test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const emptyTest = (): TestRecord => {
  const now = Date.now();
  return { id: newId(), title: '', description: '', language: 'en', durationMinutes: 30, questions: [], answerKey: {}, createdAt: now, updatedAt: now };
};
const emptyQuestion = (): Question => ({ id: newId(), prompt: '', options: ['', '', '', ''], source: 'manual' });

export default function App() {
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [draft, setDraft] = useState<TestRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refreshTests = useCallback(async () => {
    setLoading(true);
    try {
      setTests((await listTests()).sort((a, b) => b.updatedAt - a.updatedAt));
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? `Could not read local database: ${reason.message}` : 'Could not read local database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refreshTests(); }, [refreshTests]);

  const startNewTest = () => {
    setDraft(emptyTest());
    setError('');
    setNotice('');
  };

  const openTest = async (id: string) => {
    setBusy(true);
    try {
      const test = await getTest(id);
      if (!test) throw new Error('This test no longer exists. Refresh the list and try again.');
      setDraft(test);
      setError('');
      setNotice('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not open this test.');
    } finally {
      setBusy(false);
    }
  };

  const patchDraft = (patch: Partial<TestRecord>) => setDraft((current) => current ? { ...current, ...patch } : current);

  const updateQuestion = (questionId: string, patch: Partial<Question>) => {
    setDraft((current) => current ? {
      ...current,
      questions: current.questions.map((question) => question.id === questionId ? { ...question, ...patch } : question),
    } : current);
  };

  const addQuestion = () => setDraft((current) => current ? { ...current, questions: [...current.questions, emptyQuestion()] } : current);

  const removeQuestion = (questionId: string) => setDraft((current) => {
    if (!current) return current;
    const answerKey = { ...current.answerKey };
    delete answerKey[questionId];
    return { ...current, answerKey, questions: current.questions.filter((question) => question.id !== questionId) };
  });

  const setCorrectAnswer = (questionId: string, optionIndex: number) => setDraft((current) => current ? {
    ...current,
    answerKey: { ...current.answerKey, [questionId]: optionIndex },
  } : current);

  const saveCurrentTest = async () => {
    if (!draft) return;
    if (!draft.title.trim()) {
      setError('Enter a test name before saving.');
      return;
    }
    if (!Number.isFinite(draft.durationMinutes) || draft.durationMinutes < 1) {
      setError('Test duration must be at least one minute.');
      return;
    }
    const invalidQuestion = draft.questions.findIndex((question) => !question.prompt.trim() || question.options.filter((option) => option.trim()).length < 2);
    if (invalidQuestion !== -1) {
      setError(`Question ${invalidQuestion + 1} needs question text and at least two options.`);
      return;
    }
    const invalidAnswer = draft.questions.findIndex((question) => {
      const answerIndex = draft.answerKey[question.id];
      return answerIndex !== undefined && !question.options[answerIndex]?.trim();
    });
    if (invalidAnswer !== -1) {
      setError(`Question ${invalidAnswer + 1} has a correct answer selected for an empty option.`);
      return;
    }

    setBusy(true);
    try {
      const saved = { ...draft, title: draft.title.trim(), updatedAt: Date.now() };
      await saveTest(saved);
      setDraft(saved);
      await refreshTests();
      setNotice('Test saved in this browser. It is not synced to a server.');
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? `Could not save test: ${reason.message}` : 'Could not save test.');
    } finally {
      setBusy(false);
    }
  };

  const removeTest = async (test: TestRecord) => {
    if (!window.confirm(`Delete “${test.title}” from this browser? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteTest(test.id);
      if (draft?.id === test.id) setDraft(null);
      await refreshTests();
      setNotice('Test deleted from this browser.');
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? `Could not delete test: ${reason.message}` : 'Could not delete test.');
    } finally {
      setBusy(false);
    }
  };

  const downloadStudentPackage = () => {
    if (!draft) return;
    const payload = toPublicTest(draft);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${draft.title.trim().replace(/[^\p{L}\p{N}-]+/gu, '-').replace(/^-|-$/g, '') || 'test'}-student.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Student question package exported without the answer key. This local export is not server-side security.');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div><p className="eyebrow">Mission Test · Teacher workspace</p><h1>Create and manage tests</h1></div>
        <button onClick={startNewTest} disabled={busy}>＋ New test</button>
      </header>

      <div className="workspace">
        <aside className="panel test-list-panel" aria-label="Saved tests">
          <div className="panel-heading"><div><p className="eyebrow">This browser</p><h2>Saved tests</h2></div><span className="badge">{tests.length}</span></div>
          {loading ? <p className="muted">Loading saved tests…</p> : tests.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">✦</span><h3>No saved tests yet</h3><p className="muted">Create your first test. Nothing is preloaded on a clean database.</p><button className="secondary" onClick={startNewTest}>Create a test</button></div>
          ) : (
            <ul className="saved-test-list">
              {tests.map((test) => (
                <li key={test.id} className={draft?.id === test.id ? 'saved-test selected' : 'saved-test'}>
                  <button className="test-open" onClick={() => void openTest(test.id)} disabled={busy}>
                    <strong>{test.title}</strong><span>{test.questions.length} questions · {test.durationMinutes} min</span>
                  </button>
                  <button className="icon-button danger-text" aria-label={`Delete ${test.title}`} title="Delete test" disabled={busy} onClick={() => void removeTest(test)}>×</button>
                </li>
              ))}
            </ul>
          )}
          <p className="storage-note">Saved on this device with IndexedDB. Clearing browser data removes these tests.</p>
        </aside>

        <main className="panel editor-panel">
          {!draft ? (
            <div className="editor-empty"><p className="eyebrow">Test editor</p><h2>Select a saved test or create a new one</h2><p className="muted">Question text and options stay exactly as you enter them. Correct answers are stored separately from question display data.</p><button onClick={startNewTest}>＋ Create new test</button></div>
          ) : (
            <>
              <div className="panel-heading"><div><p className="eyebrow">{tests.some((test) => test.id === draft.id) ? 'Edit saved test' : 'New test'}</p><h2>Test details</h2></div><span className="badge">{draft.questions.length} questions</span></div>
              <div className="details-grid">
                <label className="field-label">Test name <span className="required">*</span><input value={draft.title} maxLength={120} onChange={(event) => patchDraft({ title: event.target.value })} placeholder="e.g. Chapter 1 assessment" /></label>
                <label className="field-label">Duration (minutes) <span className="required">*</span><input type="number" min="1" max="600" value={draft.durationMinutes} onChange={(event) => patchDraft({ durationMinutes: Number(event.target.value) })} /></label>
                <label className="field-label">Language<select value={draft.language} onChange={(event) => patchDraft({ language: event.target.value as TestRecord['language'] })}><option value="en">English</option><option value="hi">हिन्दी</option></select></label>
                <label className="field-label details-wide">Instructions / description<textarea rows={2} value={draft.description} onChange={(event) => patchDraft({ description: event.target.value })} placeholder="Optional instructions from the teacher" /></label>
              </div>

              <div className="question-section-heading"><div><p className="eyebrow">Question paper</p><h2>Questions and answer key</h2></div><button className="secondary" onClick={addQuestion}>＋ Add question</button></div>
              <p className="muted small">Question content is not automatically rewritten. Mark a correct option only when you know the answer; no answer is filled in for you.</p>

              <div className="question-editor-list">
                {draft.questions.map((question, index) => (
                  <article className="question-card" key={question.id}>
                    <div className="question-card-heading"><p className="question-number">Question {index + 1}</p><button className="text-button danger-text" onClick={() => removeQuestion(question.id)}>Delete question</button></div>
                    <label className="field-label">Question text<textarea rows={2} value={question.prompt} onChange={(event) => updateQuestion(question.id, { prompt: event.target.value })} placeholder="Enter the question exactly as intended" /></label>
                    <div className="options-grid">
                      {question.options.map((option, optionIndex) => (
                        <div className="option-editor" key={`${question.id}-option-${optionIndex}`}>
                          <label className="correct-choice" title="Mark this as the correct answer"><input type="radio" name={`answer-${question.id}`} checked={draft.answerKey[question.id] === optionIndex} onChange={() => setCorrectAnswer(question.id, optionIndex)} />{String.fromCharCode(65 + optionIndex)}</label>
                          <input aria-label={`Question ${index + 1}, option ${String.fromCharCode(65 + optionIndex)}`} value={option} onChange={(event) => { const options = [...question.options]; options[optionIndex] = event.target.value; updateQuestion(question.id, { options }); }} placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`} />
                        </div>
                      ))}
                    </div>
                    <p className="answer-status">{draft.answerKey[question.id] === undefined ? 'Answer key not set' : `Correct option: ${String.fromCharCode(65 + draft.answerKey[question.id])}`}</p>
                  </article>
                ))}
                {draft.questions.length === 0 && <div className="empty-questions"><p>No questions added. Start by adding a question.</p><button className="secondary" onClick={addQuestion}>＋ Add first question</button></div>}
              </div>

              <div className="editor-actions"><button onClick={() => void saveCurrentTest()} disabled={busy}>{busy ? 'Saving…' : 'Save test'}</button><button className="secondary" onClick={downloadStudentPackage} disabled={!draft.title.trim()}>Export student questions</button><button className="text-button" onClick={() => { setDraft(null); setError(''); setNotice(''); }}>Close editor</button></div>
              <p className="security-note"><strong>Security note:</strong> this is a local-only prototype. The export excludes the answer key, but there is no server-side authorization or scoring; do not use it for secure/high-stakes exams.</p>
            </>
          )}
          {error && <p className="error" role="alert">{error}</p>}
          {notice && <p className="success" role="status">{notice}</p>}
        </main>
      </div>
      <footer className="footer">Mission Test · Tests are stored locally on this device; no account or cloud sync is configured.</footer>
    </div>
  );
}
