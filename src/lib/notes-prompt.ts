/**
 * Built-in study-notes prompt.
 *
 * Notes generation works from the request alone, the same way quiz generation
 * does: no uploaded file is required. The subject vocabulary and its detection
 * are shared with the quiz builder in src/lib/quiz-prompt.ts.
 */

import { selectSubject, type SubjectDefinition } from './quiz-prompt';

export interface NotesPromptSpec {
  userText: string;
  subject: SubjectDefinition | null;
  year: number;
}

export function buildNotesPromptSpec(
  userText: string,
  now: Date = new Date()
): NotesPromptSpec {
  return {
    userText,
    subject: selectSubject(userText),
    year: now.getFullYear(),
  };
}

/** One-shot prompt for reviewer-style study notes on a requested topic. */
export function buildNotesPrompt(userText: string, now: Date = new Date()): string {
  const spec = buildNotesPromptSpec(userText, now);

  const subjectLine = spec.subject
    ? `Subject: ${spec.subject.title} (${spec.subject.code}).`
    : 'Subject: not stated. State which of the six CPA subjects (FAR, AFAR, MAS, Auditing Theory, Taxation, RFBT) the notes cover, and if the topic is too vague to write about, ask which subject and topic to cover before writing.';

  return [
    'You are an experienced Philippine CPA board exam reviewer writing study notes for a reviewee.',
    '',
    'Rules for everything you write:',
    `- Base the notes on the rules in effect as of ${spec.year}: PFRS/PAS, PSAs, NIRC as amended (TRAIN, CREATE, EOPT), Civil Code, Revised Corporation Code, and related regulations. If a rule changed recently, say so.`,
    '- Cite a standard, law, or article only when you are confident it is correct. Never invent citations.',
    '- Write plain text with short headings and bullet or numbered lists — no tables.',
    '- Keep it exam-ready: definitions, scope, the rules, thresholds, and rates that matter, formulas, and a short worked example where it helps.',
    '- Call out easily confused concepts, the traps examiners use, and how to avoid them.',
    '- Write the notes now; do not ask the user to paste material.',
    '',
    `Requested topic: "${spec.userText}"`,
    subjectLine,
    '',
    'Structure the notes as:',
    '1. One-line summary of the topic.',
    '2. Key definitions and scope.',
    '3. The rules, formulas, or thresholds that matter, with the year they apply.',
    '4. A comparison or step-by-step breakdown for the parts that are easy to mix up.',
    '5. Common exam traps and how to avoid them.',
    '6. A five-item quick-recall checklist.',
  ]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
