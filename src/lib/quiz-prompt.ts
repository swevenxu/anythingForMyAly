/**
 * Built-in CPA quiz prompt assembly.
 *
 * `cpa-quiz-prompts.md` (repo root, user-editable) is the source of truth for how
 * the AI should write board-style practice questions. This module loads the
 * "Setup prompt" (section 1) plus the subject prompt that best matches the
 * request, fills in every `[bracketed]` placeholder, and returns a single prompt
 * the model can act on in one shot — no uploaded file required.
 *
 * Because the markdown file is user-editable, everything here is parsed from the
 * file (headings, fenced blocks, bracket lists) instead of hardcoding prompt text.
 * If the file is missing or malformed, the builders return `undefined` so the API
 * route can answer with a clear error instead of a broken prompt.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

export interface SubjectDefinition {
  code: string;
  title: string;
  /** Loose cues used to detect the subject in a free-text request. */
  keywords: string[];
  /** Item count used when the request does not say how many questions to make. */
  defaultCount: number;
}

export const SUBJECTS: SubjectDefinition[] = [
  {
    code: 'FAR',
    title: 'Financial Accounting and Reporting',
    defaultCount: 10,
    keywords: [
      'far',
      'financial accounting',
      'financial statement',
      'conceptual framework',
      'pas 1',
      'pas 2',
      'pas 7',
      'pas 8',
      'pas 12',
      'pas 16',
      'pas 19',
      'pas 33',
      'pas 36',
      'pas 38',
      'pfrs 9',
      'pfrs 15',
      'pfrs 16',
      'inventories',
      'receivables',
      'ppe',
      'property plant and equipment',
      'intangible',
      'impairment',
      'revenue recognition',
      'lease',
      'financial instrument',
      'bonds payable',
      'notes payable',
      'deferred tax',
      'employee benefits',
      'earnings per share',
      'cash flows',
      'accounting changes',
      'share capital',
      'retained earnings',
    ],
  },
  {
    code: 'AFAR',
    title: 'Advanced Financial Accounting and Reporting',
    defaultCount: 8,
    keywords: [
      'afar',
      'advanced financial accounting',
      'partnership',
      'liquidation',
      'business combination',
      'pfrs 3',
      'consolidation',
      'consolidated financial statements',
      'pfrs 10',
      'non-controlling interest',
      'goodwill',
      'joint arrangement',
      'pfrs 11',
      'associate',
      'pas 28',
      'foreign currency',
      'pas 21',
      'translation',
      'derivative',
      'hedge',
      'home office',
      'branch',
      'interim reporting',
      'pas 34',
      'segment reporting',
      'pfrs 8',
      'construction contract',
      'government accounting',
    ],
  },
  {
    code: 'MAS',
    title: 'Management Advisory Services',
    defaultCount: 10,
    keywords: [
      'mas',
      'management advisory',
      'management services',
      'cvp',
      'cost-volume-profit',
      'absorption costing',
      'variable costing',
      'job order',
      'process costing',
      'standard costing',
      'variance',
      'budgeting',
      'relevant costing',
      'make or buy',
      'capital budgeting',
      'npv',
      'irr',
      'payback',
      'cost of capital',
      'working capital',
      'financial ratio',
      'transfer pricing',
      'activity-based',
      'balanced scorecard',
      'eoq',
      'inventory models',
    ],
  },
  {
    code: 'AT',
    title: 'Auditing Theory',
    defaultCount: 15,
    keywords: [
      'auditing theory',
      'auditing',
      'audit',
      'psa 200',
      'engagement acceptance',
      'psa 210',
      'quality management',
      'materiality',
      'psa 320',
      'risk assessment',
      'psa 315',
      'psa 330',
      'audit evidence',
      'psa 500',
      'sampling',
      'psa 530',
      'internal control',
      'fraud',
      'psa 240',
      'going concern',
      'psa 570',
      'audit report',
      'psa 700',
      'modified opinion',
      'psa 705',
      'psa 706',
      'code of ethics',
      'assurance engagement',
    ],
  },
  {
    code: 'TAX',
    title: 'Taxation',
    defaultCount: 10,
    keywords: [
      'taxation',
      'income tax',
      'individual income tax',
      'corporate income tax',
      'rcit',
      'mcit',
      'passive income',
      'final tax',
      'deductions',
      'nolco',
      'fringe benefits',
      'withholding',
      'vat',
      'percentage tax',
      'estate tax',
      'donors tax',
      'excise tax',
      'documentary stamp',
      'tax remedies',
      'assessment',
      'refund',
      'local government taxation',
      'tax incentives',
      'bir',
    ],
  },
  {
    code: 'RFBT',
    title: 'Regulatory Framework for Business Transactions',
    defaultCount: 15,
    keywords: [
      'rfbt',
      'regulatory',
      'obligations',
      'contracts',
      'sales',
      'agency',
      'negotiable instruments',
      'insurance',
      'corporation law',
      'revised corporation code',
      'insolvency',
      'rehabilitation',
      'data privacy',
      'anti-money laundering',
      'competition',
      'consumer',
      'intellectual property',
    ],
  },
];

/**
 * Cues that name a subject outright. These win over topic keywords so requests
 * like "FAR quiz on income taxes" are never routed to Taxation.
 * (The code "AT" is deliberately absent: "at" is a common English word and would
 * match requests like "quiz at hard difficulty".)
 */
const EXPLICIT_SUBJECTS: Array<{ code: string; words: string[]; phrases: string[] }> = [
  { code: 'AFAR', words: ['afar'], phrases: ['advanced financial accounting'] },
  { code: 'FAR', words: ['far'], phrases: ['financial accounting and reporting'] },
  { code: 'MAS', words: ['mas'], phrases: ['management advisory services', 'management services'] },
  { code: 'TAX', words: ['taxation'], phrases: ['income taxation'] },
  { code: 'AT', words: [], phrases: ['auditing theory', 'audit theory'] },
  { code: 'RFBT', words: ['rfbt'], phrases: ['regulatory framework for business transactions'] },
];

const STOPWORDS = new Set([
  'and',
  'the',
  'for',
  'with',
  'vs',
  'versus',
  'from',
  'into',
  'only',
  'all',
  'any',
  'one',
  'two',
  'other',
  'under',
  'about',
  'that',
  'this',
  'your',
  'own',
  'per',
  'via',
  'its',
  'not',
  'but',
  'are',
  'was',
  'were',
  'has',
  'have',
  'had',
  'can',
  'could',
  'should',
  'would',
  'may',
  'might',
  'must',
  'use',
  'using',
  'ask',
  'make',
  'need',
  'want',
  'give',
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokens(text: string): string[] {
  return normalize(text).split(' ').filter(Boolean);
}

/** Crude singular form so "taxes" matches "tax" and "leases" matches "lease". */
function stem(word: string): string {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && word.endsWith('es')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s')) return word.slice(0, -1);
  return word;
}

function stems(text: string): string[] {
  return tokens(text).map(stem);
}

function containsSequence(hay: string[], needle: string[]): boolean {
  if (needle.length === 0 || needle.length > hay.length) return false;

  outer: for (let i = 0; i <= hay.length - needle.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) {
      if (hay[i + j] !== needle[j]) continue outer;
    }
    return true;
  }

  return false;
}

function subjectByCode(code: string): SubjectDefinition {
  const subject = SUBJECTS.find((row) => row.code === code);
  if (!subject) throw new Error(`Unknown subject code: ${code}`);
  return subject;
}

function findExplicitSubject(hay: string[]): SubjectDefinition | null {
  const joined = ` ${hay.join(' ')} `;

  for (const rule of EXPLICIT_SUBJECTS) {
    if (rule.words.some((word) => hay.includes(stem(word)))) return subjectByCode(rule.code);
  }

  for (const rule of EXPLICIT_SUBJECTS) {
    if (rule.phrases.some((phrase) => joined.includes(` ${stems(phrase).join(' ')} `))) {
      return subjectByCode(rule.code);
    }
  }

  return null;
}

/** Longer, more specific keyword matches score higher than short generic ones. */
function keywordScore(hay: string[], subject: SubjectDefinition): number {
  let score = 0;

  for (const keyword of subject.keywords) {
    const needle = stems(keyword);
    if (containsSequence(hay, needle)) {
      score += needle.length * 4 + needle.join('').length;
    }
  }

  return score;
}

export function selectSubject(userText: string): SubjectDefinition | null {
  const hay = stems(userText);
  if (hay.length === 0) return null;

  const explicit = findExplicitSubject(hay);
  if (explicit) return explicit;

  let best: SubjectDefinition | null = null;
  let bestScore = 0;

  for (const subject of SUBJECTS) {
    const score = keywordScore(hay, subject);
    if (score > bestScore) {
      best = subject;
      bestScore = score;
    }
  }

  return best;
}

function splitSections(markdown: string): string[] {
  return markdown
    .split(/^---\s*$/m)
    .map((section) => section.trim())
    .filter(Boolean);
}

function headingOf(section: string): string {
  const match = section.match(/^##\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

/**
 * Match the subject's own section, e.g. "## 2. FAR (...)", "## 5. Auditing
 * Theory". Code tokens are checked first so FAR never matches the AFAR heading
 * (whose title contains "Financial Accounting and Reporting").
 */
function sectionForSubject(sections: string[], subject: SubjectDefinition): string | null {
  const code = normalize(subject.code);
  const byCode = sections.find((section) => tokens(headingOf(section)).includes(code));
  if (byCode) return byCode;

  const title = normalize(subject.title);
  return sections.find((section) => normalize(headingOf(section)).includes(title)) ?? null;
}

export function extractFencedBlock(section: string): string | null {
  const match = section.match(/```[a-z]*\n([\s\S]*?)```/i);
  return match ? match[1].trim() : null;
}

export interface QuizPromptSpec {
  userText: string;
  subject: SubjectDefinition | null;
  count: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  computationalShare: number;
  theoryShare: number;
  year: number;
}

function clampCount(value: number): number {
  return Math.min(100, Math.max(1, value));
}

function detectCount(userText: string, subject: SubjectDefinition | null): number {
  const match = userText.match(/\b(\d{1,3})\s*[-\s]?\s*(?:items?|questions?|mcqs?|numbers?)\b/i);
  if (match) return clampCount(Number.parseInt(match[1], 10));
  if (/\bmock\s*(?:exam|test)\b/i.test(userText)) return 50;
  return subject?.defaultCount ?? 10;
}

function detectDifficulty(userText: string): QuizPromptSpec['difficulty'] {
  if (/\b(hard|harder|difficult|advanced|challenging)\b/i.test(userText)) return 'hard';
  if (/\b(easy|easier|beginner|basic|simple)\b/i.test(userText)) return 'easy';
  if (/\b(medium|moderate|intermediate|average)\b/i.test(userText)) return 'medium';
  return 'mixed';
}

function detectMix(userText: string): { computationalShare: number; theoryShare: number } {
  const wantsComputation = /\bcomput\w*|\bproblem\w*|\bsolv\w*|\bcalculation\w*/i.test(userText);
  const wantsTheory = /\btheor\w*|\bconceptual\b|\bconcept\w*/i.test(userText);

  if (wantsTheory && !wantsComputation) return { computationalShare: 40, theoryShare: 60 };
  // Board-style sets lean computational, matching the defaults in the prompt file.
  return { computationalShare: 60, theoryShare: 40 };
}

export function buildQuizPromptSpec(
  userText: string,
  subject: SubjectDefinition | null = selectSubject(userText),
  now: Date = new Date()
): QuizPromptSpec {
  const mix = detectMix(userText);

  return {
    userText,
    subject,
    count: detectCount(userText, subject),
    difficulty: detectDifficulty(userText),
    computationalShare: mix.computationalShare,
    theoryShare: mix.theoryShare,
    year: now.getFullYear(),
  };
}

/**
 * Pick the shortlist option closest to the request; otherwise keep the shortlist
 * so the model can choose. The earliest-mentioned option wins (a request like
 * "VAT and percentage tax" should get VAT, not whichever option scores higher),
 * with the number of matched characters as the tie-breaker.
 */
function pickOption(options: string[], spec: QuizPromptSpec): string {
  // Ignore the subject's own name (e.g. the words "Auditing theory" in "Auditing
  // theory quiz on materiality") so the match reflects the real topic words.
  const subjectWords = new Set(spec.subject ? stems(spec.subject.title) : []);
  const positions = new Map<string, number>();
  let index = 0;
  for (const token of stems(spec.userText)) {
    if (subjectWords.has(token)) continue;
    if (!positions.has(token)) positions.set(token, index);
    index += 1;
  }

  let best: string | null = null;
  let bestPosition = Number.POSITIVE_INFINITY;
  let bestScore = 0;

  for (const option of options) {
    let position = Number.POSITIVE_INFINITY;
    let score = 0;

    for (const token of stems(option)) {
      if (STOPWORDS.has(token)) continue;
      if (token.length < 3 && !/^\d+$/.test(token)) continue;

      const at = positions.get(token);
      if (at === undefined) continue;

      score += token.length;
      if (at < position) position = at;
    }

    if (score === 0) continue;

    if (position < bestPosition || (position === bestPosition && score > bestScore)) {
      best = option;
      bestPosition = position;
      bestScore = score;
    }
  }

  return best ?? options.join(', or ');
}

export function fillTemplate(template: string, spec: QuizPromptSpec): string {
  let result = template;

  // Section 1 ends with "Confirm, then wait for my next instruction." — keeping
  // it would make the model stop and wait instead of generating the quiz.
  result = result.replace(/^\s*Confirm, then wait for my next instruction\.\s*$/mi, '');

  // Rule dates.
  result = result.replace(/\[year\s*\/\s*exam date\]/gi, String(spec.year));
  result = result.replace(/\[year\]/gi, String(spec.year));

  // Mix percentages, e.g. "Mix: [60]% computational, [40]% theory".
  result = result.replace(
    /\[\s*\d+\s*\]%\s*comput(?:ational|ation)/gi,
    `${spec.computationalShare}% computational`
  );
  result = result.replace(/\[\s*\d+\s*\]%\s*theory/gi, `${spec.theoryShare}% theory`);
  result = result.replace(/\[\s*\d+\s*\]%/g, `${spec.computationalShare}%`);

  // Difficulty.
  result = result.replace(/\[easy\s*\/\s*medium\s*\/\s*hard\s*\/\s*mixed\]/gi, spec.difficulty);

  // Topic shortlist. Options are separated by " / " with spaces; single slashes
  // inside an option (e.g. "formation/operation/dissolution") are left intact.
  result = result.replace(/\[\s*pick one:\s*([^\]]+)\]/gi, (_match, list: string) =>
    pickOption(
      list
        .split(/\s+\/\s+/)
        .map((option) => option.trim())
        .filter(Boolean),
      spec
    )
  );

  // MAS asks for "at least [3] questions with distractor data" — keep that number.
  result = result.replace(/at least\s*\[3\]/gi, 'at least 3');

  // Subject placeholders used by the weak-area and mock-exam sections.
  result = result.replace(
    /\[FAR\s*\/\s*AFAR\s*\/\s*MAS\s*\/\s*Auditing Theory\s*\/\s*Taxation\s*\/\s*RFBT\]/gi,
    spec.subject ? spec.subject.code : SUBJECTS.map((subject) => subject.code).join(' / ')
  );
  result = result.replace(
    /\[subject\]/gi,
    spec.subject ? `${spec.subject.title} (${spec.subject.code})` : 'the subject the user chooses'
  );

  // Free-text paste-ins.
  result = result.replace(/\[topic and what confuses you\]/gi, spec.userText);
  result = result.replace(/\[paste[^\]]*\]/gi, '');

  // Remaining bracketed numbers are item counts.
  result = result.replace(/\[(\d+)\]/g, String(spec.count));

  // Never leak a leftover placeholder to the model.
  result = result.replace(/\[([^\[\]]*)\]/g, '$1');

  return result.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function buildDirective(spec: QuizPromptSpec): string {
  const lines = [`User request: "${spec.userText}"`];

  if (spec.subject) {
    lines.push(
      `Subject: ${spec.subject.title} (${spec.subject.code}).`,
      'Generate the quiz now — do not reply with just a confirmation. Number every item and put the answer key with explanations after the questions, still in multiple-choice format (A-D).'
    );
  } else {
    lines.push(
      'The request does not name one of the six CPA subjects (FAR, AFAR, MAS, Auditing Theory, Taxation, RFBT).',
      'Ask which subject to quiz on before writing any question — do not guess a subject.'
    );
  }

  return lines.join('\n');
}

/**
 * Assemble the one-shot quiz prompt from the markdown contents. Exported
 * separately from the file read so it can be tested without touching disk.
 */
export function buildQuizPromptFromMarkdown(
  markdown: string,
  userText: string,
  now: Date = new Date()
): string | undefined {
  const sections = splitSections(markdown);

  const setupSection = sections.find((section) => /setup prompt/i.test(headingOf(section)));
  if (!setupSection) return undefined;

  const setupBlock = extractFencedBlock(setupSection);
  if (!setupBlock) return undefined;

  const subject = selectSubject(userText);
  const spec = buildQuizPromptSpec(userText, subject, now);

  const parts = [fillTemplate(setupBlock, spec)];

  if (subject) {
    const subjectSection = sectionForSubject(sections, subject);
    const subjectBlock = subjectSection ? extractFencedBlock(subjectSection) : null;
    if (subjectBlock) parts.push(fillTemplate(subjectBlock, spec));
  }

  parts.push(buildDirective(spec));

  return parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Where the prompt file lives; override with CPA_QUIZ_PROMPTS_PATH when needed. */
export function quizPromptsPath(): string {
  const override = process.env.CPA_QUIZ_PROMPTS_PATH;
  if (override && override.trim().length > 0) return override;
  return path.join(process.cwd(), 'cpa-quiz-prompts.md');
}

/** Load the prompt file and build the quiz prompt, or undefined when unavailable. */
export function buildQuizPrompt(userText: string): string | undefined {
  try {
    const markdown = readFileSync(quizPromptsPath(), 'utf8');
    return buildQuizPromptFromMarkdown(markdown, userText);
  } catch (error) {
    console.error('Could not load the built-in quiz prompts:', error);
    return undefined;
  }
}
