/**
 * Built-in prompt for formula-identification quizzes.
 *
 * Formula generation is intentionally separate from notes so the model is
 * prompted to produce the same numbered MCQ interaction as quiz mode.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { selectSubject, type SubjectDefinition } from './quiz-prompt';

interface FormulaEntry {
  slug: string;
  name: string;
  subject: string;
  topic: string;
  formula: string;
  latex: string;
  useWhen: string;
  confusedWith: string;
  note?: string;
}

export interface FormulaPromptSpec {
  userText: string;
  subject: SubjectDefinition | null;
  year: number;
}

export function buildFormulaPromptSpec(
  userText: string,
  now: Date = new Date()
): FormulaPromptSpec {
  return {
    userText,
    subject: selectSubject(userText),
    year: now.getFullYear(),
  };
}

function formulasPath(): string {
  return process.env.CPA_FORMULAS_PATH || path.join(process.cwd(), 'cpa_formulas_quiz.md');
}

function parseFormulaBank(markdown: string): FormulaEntry[] {
  return markdown
    .split(/^###\s+/m)
    .slice(1)
    .map((section) => {
      const lines = section.split('\n');
      const heading = lines.shift()?.trim() ?? '';
      const separator = heading.indexOf(' — ');
      const fields = new Map<string, string>();

      for (const line of lines) {
        const match = line.match(/^- ([a-z ]+):\s*(.+)$/i);
        if (match) fields.set(match[1].toLowerCase(), match[2].trim());
      }

      return {
        slug: separator >= 0 ? heading.slice(0, separator).trim() : heading,
        name: separator >= 0 ? heading.slice(separator + 3).trim() : heading,
        subject: fields.get('subject') ?? '',
        topic: fields.get('topic') ?? '',
        formula: fields.get('formula') ?? '',
        latex: fields.get('latex') ?? '',
        useWhen: fields.get('use when') ?? '',
        confusedWith: fields.get('confused with') ?? '',
        note: fields.get('note'),
      };
    })
    .filter((entry) => entry.slug && entry.formula && entry.subject && entry.topic);
}

function matchingEntries(entries: FormulaEntry[], spec: FormulaPromptSpec): FormulaEntry[] {
  const subjectCode = spec.subject?.code === 'MAS' ? 'MS' : spec.subject?.code;
  const subjectEntries = subjectCode
    ? entries.filter((entry) => entry.subject.toUpperCase() === subjectCode)
    : entries;
  const request = spec.userText.toLowerCase();
  const topicMatches = subjectEntries.filter((entry) =>
    entry.topic.toLowerCase().split(/[^a-z0-9]+/).some((word) => word.length >= 4 && request.includes(word))
  );

  return (topicMatches.length > 0 ? topicMatches : subjectEntries).slice(0, 18);
}

function formatEntries(entries: FormulaEntry[]): string {
  return entries
    .map((entry) =>
      [
        `- slug: ${entry.slug}`,
        `  name: ${entry.name}`,
        `  subject: ${entry.subject}`,
        `  topic: ${entry.topic}`,
        `  formula: ${entry.formula}`,
        `  latex: ${entry.latex}`,
        `  use when: ${entry.useWhen}`,
        `  confused with: ${entry.confusedWith || 'none'}`,
        entry.note ? `  note: ${entry.note}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    )
    .join('\n\n');
}

export function buildFormulaPrompt(userText: string, now: Date = new Date()): string | undefined {
  const spec = buildFormulaPromptSpec(userText, now);
  const subjectLine = spec.subject
    ? `Subject: ${spec.subject.title} (${spec.subject.code}).`
    : 'Subject: not stated. Ask which CPA subject and topic the formula guide should cover before writing.';
  let entries: FormulaEntry[];

  try {
    entries = matchingEntries(parseFormulaBank(readFileSync(formulasPath(), 'utf8')), spec);
  } catch (error) {
    console.error('Could not load the CPA formula bank:', error);
    return undefined;
  }

  if (entries.length === 0) return undefined;

  return [
    'You are an experienced Philippine CPA board exam reviewer creating a formula-identification quiz for a reviewee.',
    '',
    'Rules for everything you write:',
    '- Create 10 multiple-choice questions. Each must have exactly four formula choices labeled A-D and one correct answer.',
    '- Describe a short realistic scenario and ask which formula should be used; do not ask the student to compute the answer.',
    '- Use only the supplied formula-bank entries. Keep the formula text exactly as supplied and use confused-with entries as distractors when possible.',
    '- Do not reveal the formula name in the scenario. After the questions, provide the answer key with the formula name, formula, and a brief reason the distractors do not fit.',
    '- Do not use a table. Output every question exactly as: `1. Scenario/question`, followed by four separate lines `A. ...`, `B. ...`, `C. ...`, `D. ...`. After all questions, write `Answer Key` and one answer per line such as `1. B - explanation`.',
    `- Treat rates and rules as of ${spec.year}; if a formula depends on a year or assumption, state that in the explanation.`,
    '- Do not invent formulas, rates, thresholds, or citations.',
    '',
    `Requested topic: "${spec.userText}"`,
    subjectLine,
    '',
    'Formula-bank entries available for this quiz:',
    formatEntries(entries),
  ]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
