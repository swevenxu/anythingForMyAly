import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { buildQuizPromptFromMarkdown, selectSubject } from './quiz-prompt';

const markdown = readFileSync(path.join(process.cwd(), 'cpa-quiz-prompts.md'), 'utf8');

test('detects the subject from loose exam wording', () => {
  assert.equal(selectSubject('Make a quiz about deferred tax')?.code, 'FAR');
  assert.equal(selectSubject('Taxation quiz on VAT and percentage tax')?.code, 'TAX');
  assert.equal(selectSubject('Give me an AFAR mock exam on consolidation')?.code, 'AFAR');
  assert.equal(selectSubject('Auditing theory items on audit evidence')?.code, 'AT');
  assert.equal(selectSubject('MAS drill on variance analysis')?.code, 'MAS');
  assert.equal(selectSubject('RFBT situational questions about contracts')?.code, 'RFBT');
  assert.equal(selectSubject('Quiz me on anything'), null);
});

test('an explicitly named subject wins over topic keywords', () => {
  assert.equal(selectSubject('FAR quiz on income taxes')?.code, 'FAR');
  assert.equal(selectSubject('taxation quiz about deferred tax accounting')?.code, 'TAX');
});

test('fills the setup, subject, count, difficulty, and mix placeholders', () => {
  const prompt = buildQuizPromptFromMarkdown(
    markdown,
    'Create a 15-item Taxation quiz on VAT, hard difficulty'
  );

  assert.ok(prompt);
  assert.match(prompt, /experienced Philippine CPA board exam reviewer/);
  assert.match(prompt, /Create 15 Taxation board-style multiple-choice questions only/);
  assert.match(prompt, /on VAT\b/);
  assert.match(prompt, /60% computational, 40% theory/);
  assert.match(prompt, /User request: "Create a 15-item Taxation quiz/);
  assert.match(prompt, /Subject: Taxation \(TAX\)/);
  assert.doesNotMatch(prompt, /\[[^\]]*\]/); // no leftover placeholders
  assert.doesNotMatch(prompt, /Confirm, then wait/); // one-shot generation
});

test('keeps the requested count and picks the topic from the shortlist', () => {
  const prompt = buildQuizPromptFromMarkdown(
    markdown,
    'Build a 50-item AFAR mock exam on business combination'
  );

  assert.ok(prompt);
  assert.match(prompt, /Create 50 AFAR board-style multiple-choice questions only/);
  assert.match(prompt, /business combination \(PFRS 3\)/);
  assert.match(prompt, /Subject: Advanced Financial Accounting and Reporting \(AFAR\)/);
  assert.doesNotMatch(prompt, /\[[^\]]*\]/);
});

test('treats the earlier-mentioned topic as the headline topic', () => {
  const prompt = buildQuizPromptFromMarkdown(
    markdown,
    'Taxation quiz on VAT and percentage tax, 10 items'
  );

  assert.ok(prompt);
  assert.match(prompt, /one correct answer\) on VAT\./);
});

test('picks the closest topic option and drops the shortlist wrapper', () => {
  const prompt = buildQuizPromptFromMarkdown(
    markdown,
    'Auditing theory quiz on materiality, 10 items'
  );

  assert.ok(prompt);
  assert.match(prompt, /planning and materiality \(PSA 300, 320\)/);
  assert.doesNotMatch(prompt, /pick one:/i);
});

test('keeps MAS distractor-count instruction intact', () => {
  const prompt = buildQuizPromptFromMarkdown(
    markdown,
    'MAS quiz on capital budgeting, 12 items, easy'
  );

  assert.ok(prompt);
  assert.match(prompt, /Create 12 MAS board-style multiple-choice questions only/);
  assert.match(prompt, /capital budgeting \(NPV, IRR, payback, ARR\)/);
  assert.match(prompt, /at least 3 questions with distractor data/);
  assert.doesNotMatch(prompt, /\[[^\]]*\]/);
});

test('asks for a subject instead of guessing one', () => {
  const prompt = buildQuizPromptFromMarkdown(markdown, 'Give me a quiz');

  assert.ok(prompt);
  assert.match(prompt, /Ask which subject to quiz on/);
  assert.doesNotMatch(prompt, /board-style multiple-choice questions only/);
  assert.doesNotMatch(prompt, /\[[^\]]*\]/);
});

test('uses the year for rules-as-of placeholders', () => {
  const prompt = buildQuizPromptFromMarkdown(
    markdown,
    'FAR quiz on leases',
    new Date('2026-10-08T00:00:00Z')
  );

  assert.ok(prompt);
  assert.match(prompt, /rules in effect as of 2026/);
});
