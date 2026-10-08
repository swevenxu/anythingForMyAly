import assert from 'node:assert/strict';
import test from 'node:test';
import { buildNotesPrompt } from './notes-prompt';

const now = new Date('2026-10-08T00:00:00Z');

test('writes notes for the detected subject and topic', () => {
  const prompt = buildNotesPrompt(
    'Create study notes on PAS 12 deferred tax',
    now
  );

  assert.match(prompt, /experienced Philippine CPA board exam reviewer writing study notes/);
  assert.match(prompt, /Requested topic: "Create study notes on PAS 12 deferred tax"/);
  assert.match(prompt, /Subject: Financial Accounting and Reporting \(FAR\)/);
  assert.match(prompt, /rules in effect as of 2026/);
  assert.match(prompt, /five-item quick-recall checklist/);
});

test('keeps working when the request names no subject', () => {
  const prompt = buildNotesPrompt('Review notes on things I keep forgetting', now);

  assert.match(prompt, /Subject: not stated/);
  assert.match(prompt, /ask which subject and topic to cover before writing/);
});

test('needs no uploaded material and leaves no placeholders', () => {
  const prompt = buildNotesPrompt('Taxation notes on VAT and percentage tax', now);

  assert.match(prompt, /Subject: Taxation \(TAX\)/);
  assert.doesNotMatch(prompt, /Source material:/);
  assert.doesNotMatch(prompt, /\[[^\]]*\]/);
});
