import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateCompletion } from './completion-check';
import { questionHash } from './question-hash';

const SUBJECT_NAMES = [
  'Financial Accounting and Reporting',
  'Advanced Financial Accounting and Reporting',
  'Management Services',
  'Auditing Theory',
  'Taxation',
  'Regulatory Framework for Business Transactions',
];

type QuizRow = { question: string; options: unknown };
type QuestionRow = { id: string; topic_id: string | null };
type TopicRow = { id: string; name: string };
type AttemptRow = { question_id: string; is_correct: boolean; answered_at: string };

function validOptions(correctLabel: 'A' | 'B' | 'C' | 'D') {
  const labels = ['A', 'B', 'C', 'D'] as const;
  return labels.map((label) => ({
    label,
    text: `${label} option`,
    is_correct: label === correctLabel,
  }));
}

/** Full-fixture world: all 6 subjects exist; each subject has one quiz,
 *  one matching question, and one latest-correct attempt. */
function buildWorld() {
  const topics: TopicRow[] = SUBJECT_NAMES.map((name, i) => ({ id: `topic-${i + 1}`, name }));
  const quizzes: QuizRow[] = [];
  const questions: QuestionRow[] = [];
  const attempts: AttemptRow[] = [];

  SUBJECT_NAMES.forEach((name, i) => {
    const question = `Subject ${name} question number ${i}?`;
    quizzes.push({ question, options: validOptions('B') });
    questions.push({ id: questionHash(question), topic_id: topics[i].id });
    attempts.push({
      question_id: questionHash(question),
      is_correct: true,
      answered_at: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString(),
    });
  });

  return { topics, quizzes, questions, attempts };
}

test('reports complete only in the true complete state', () => {
  const w = buildWorld();
  assert.equal(evaluateCompletion(w).allComplete, true);
});

// --- Check 1: unanswered pool quizzes ----------------------------------------

test('fails when a pool quiz has no attempt yet', () => {
  const w = buildWorld();
  const result = evaluateCompletion({
    quizzes: w.quizzes,
    questions: w.questions,
    attempts: w.attempts.slice(1), // one subject never answered
    topics: w.topics,
  });
  assert.equal(result.allComplete, false);
});

test('ignores quizzes with malformed options when checking answeredness', () => {
  const w = buildWorld();
  // A quiz with broken options is filtered out by isMultipleChoiceOptions, so
  // it cannot permanently block completion (matches route behavior).
  const result = evaluateCompletion({
    quizzes: [{ question: 'Weird?', options: [{ label: 'A', text: 'Only' }] }, ...w.quizzes],
    questions: w.questions,
    attempts: w.attempts,
    topics: w.topics,
  });
  assert.equal(result.allComplete, true);
});

test('treats equivalent question text (different spacing/case/punct) as answered', () => {
  const w = buildWorld();
  const [first, ...restAttempts] = w.attempts;
  const [firstQuiz, ...restQuizzes] = w.quizzes;
  // Same semantic text as firstQuiz, but raw text differs.
  const twinQuiz = { question: `  ${firstQuiz.question.toUpperCase()}  `, options: firstQuiz.options };
  const result = evaluateCompletion({
    quizzes: [twinQuiz, ...restQuizzes],
    questions: w.questions,
    attempts: restAttempts.concat(first),
    topics: w.topics,
  });
  assert.equal(result.allComplete, true);
});

// --- Check 2: wrong latest answers -------------------------------------------

test('fails when any question\'s latest attempt is wrong', () => {
  const w = buildWorld();
  const result = evaluateCompletion({
    quizzes: w.quizzes,
    questions: w.questions,
    attempts: [
      ...w.attempts,
      { question_id: w.attempts[0].question_id, is_correct: false, answered_at: '2026-06-01T00:00:00.000Z' },
    ],
    topics: w.topics,
  });
  assert.equal(result.allComplete, false);
});

test('passes once an earlier wrong answer is corrected', () => {
  const w = buildWorld();
  const result = evaluateCompletion({
    quizzes: w.quizzes,
    questions: w.questions,
    attempts: [
      ...w.attempts,
      { question_id: w.attempts[0].question_id, is_correct: false, answered_at: '2025-01-01T00:00:00.000Z' },
    ],
    topics: w.topics,
  });
  assert.equal(result.allComplete, true);
});

// --- Check 3: per-subject mastery ---------------------------------------------

test('fails when any Pinnacle subject topic does not exist', () => {
  const w = buildWorld();
  const result = evaluateCompletion({
    quizzes: w.quizzes,
    questions: w.questions,
    attempts: w.attempts,
    topics: w.topics.slice(0, 5), // Taxation missing
  });
  assert.equal(result.allComplete, false);
});

test('fails when a subject topic exists but has zero attempts', () => {
  const w = buildWorld();
  const result = evaluateCompletion({
    topics: w.topics,
    // Quizzes exist but no attempts at all -> everything unanswered anyway.
    quizzes: w.quizzes,
    questions: w.questions.map((q) => ({ ...q })),
    attempts: [],
  });
  assert.equal(result.allComplete, false);
});

test('fails when a subject topic has attempts but some are wrong', () => {
  const w = buildWorld();
  const result = evaluateCompletion({
    quizzes: w.quizzes,
    questions: w.questions,
    attempts: w.attempts.map((a, i) => (i === 2 ? { ...a, is_correct: false } : a)),
    topics: w.topics,
  });
  assert.equal(result.allComplete, false);
});

test('fails when a subject topic has an extra wrong attempt on a shared topic id', () => {
  const w = buildWorld();
  // Multiple topics in the DB can share the same subject name in pathological
  // data; an additional question row mapped to topic-3 carrying a wrong
  // attempt must block completion for that subject.
  const extraQuestionId = 'extra-question-1';
  const result = evaluateCompletion({
    quizzes: w.quizzes,
    questions: [...w.questions, { id: extraQuestionId, topic_id: w.topics[2].id }],
    attempts: [
      ...w.attempts,
      { question_id: extraQuestionId, is_correct: false, answered_at: '2026-01-05T00:00:00.000Z' },
    ],
    topics: w.topics,
  });
  assert.equal(result.allComplete, false);
});

// --- Robustness ---------------------------------------------------------------

test('ignores attempts whose question id is not in the questions table', () => {
  const w = buildWorld();
  const result = evaluateCompletion({
    quizzes: w.quizzes,
    questions: w.questions,
    attempts: [
      ...w.attempts,
      { question_id: 'ghost-id', is_correct: true, answered_at: '2026-01-02T00:00:00.000Z' },
    ],
    topics: w.topics,
  });
  assert.equal(result.allComplete, true);
});

test('resolves timestamp ties deterministically (first-encountered row wins)', () => {
  const w = buildWorld();
  const tie = '2026-01-01T00:00:00.000Z';
  // latestAttempts() uses strict > comparison, so on an exact timestamp tie
  // the first-encountered row wins and a later row with the same timestamp
  // cannot override it. Real rows carry microsecond DB timestamps so exact
  // ties are practically impossible; this test just pins the semantics.
  const attempts = [
    ...w.attempts.slice(1),
    { question_id: w.attempts[0].question_id, is_correct: true, answered_at: tie },
    { question_id: w.attempts[0].question_id, is_correct: false, answered_at: tie },
  ];
  const result = evaluateCompletion({
    quizzes: w.quizzes,
    questions: w.questions,
    attempts,
    topics: w.topics,
  });
  assert.equal(result.allComplete, true);
});
