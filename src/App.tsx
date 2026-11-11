import { useEffect, useMemo, useState } from 'react';
import { parseQuestionsFromText } from './core/parser';
import { scoreAttempt } from './core/scoring';

type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: 'paste';
};

const sampleInput = `Q1: 2 + 2 = ?\nA. 3\nB. 4\nC. 5\nD. 6\n\nQ2: Capital of India?\nA. Delhi\nB. Mumbai\nC. Kolkata\nD. Jaipur`;

const defaultQuestions: Question[] = parseQuestionsFromText(sampleInput);

export default function App() {
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('mission-test-questions');
    if (!saved) return defaultQuestions;
    try {
      return JSON.parse(saved) as Question[];
    } catch {
      return defaultQuestions;
    }
  });
  const [draftInput, setDraftInput] = useState(sampleInput);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  useEffect(() => {
    localStorage.setItem('mission-test-questions', JSON.stringify(questions));
  }, [questions]);

  const answerKey = useMemo(
    () => Object.fromEntries(questions.map((question) => [question.id, question.correctIndex])),
    [questions]
  );

  const handleImport = () => {
    const parsed = parseQuestionsFromText(draftInput);
    if (parsed.length > 0) {
      setQuestions(parsed);
      setAnswers({});
      setResult(null);
    }
  };

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers((current) => ({ ...current, [questionId]: answerIndex }));
  };

  const handleSubmit = () => {
    const nextResult = scoreAttempt(questions, answers, answerKey);
    setResult(nextResult);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Mission Test</p>
          <h1>Teacher & Student workflow</h1>
        </div>
      </header>

      <main className="grid-layout">
        <section className="panel">
          <h2>Teacher import</h2>
          <textarea
            value={draftInput}
            onChange={(event) => setDraftInput(event.target.value)}
            rows={12}
            placeholder="Paste questions here..."
          />
          <button onClick={handleImport}>Import questions</button>

          <div className="question-preview">
            {questions.map((question, index) => (
              <div key={question.id} className="question-card">
                <p className="question-number">Q{index + 1}</p>
                <h3>{question.prompt}</h3>
                <ul>
                  {question.options.map((option, optionIndex) => (
                    <li key={`${question.id}-${optionIndex}`}>
                      {String.fromCharCode(65 + optionIndex)}. {option}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Student exam</h2>
          {questions.length === 0 ? (
            <p>No questions loaded yet.</p>
          ) : (
            <div className="student-questions">
              {questions.map((question, index) => (
                <div key={question.id} className="student-question">
                  <p className="question-number">Question {index + 1}</p>
                  <h3>{question.prompt}</h3>
                  {question.options.map((option, optionIndex) => (
                    <label key={`${question.id}-option-${optionIndex}`} className="option-row">
                      <input
                        type="radio"
                        name={question.id}
                        checked={answers[question.id] === optionIndex}
                        onChange={() => handleAnswerChange(question.id, optionIndex)}
                      />
                      <span>
                        {String.fromCharCode(65 + optionIndex)}. {option}
                      </span>
                    </label>
                  ))}
                </div>
              ))}

              <button onClick={handleSubmit}>Submit attempt</button>

              {result && (
                <div className="result-box">
                  <strong>Score:</strong> {result.score} / {result.total}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
