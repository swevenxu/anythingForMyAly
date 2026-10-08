/**
 * Minimal LLM client for the AI tab.
 *
 * Strategy:
 * - Providers that have a key are tried in order: Groq (LLM_MODEL, default
 *   openai/gpt-oss-120b), then OpenRouter (OPENROUTER_MODEL or the first
 *   entry of OPENROUTER_MODELS), then Google Gemini (GEMINI_MODEL, default
 *   gemini-3.8-flash).
 * - Transient failures (rate limits, 5xx, network) fall through to the next
 *   provider; other errors surface immediately.
 * - If no key is configured, throw a clear error so the UI can show a friendly
 *   warning instead of crashing.
 *
 * All three providers expose an OpenAI-compatible chat completions endpoint, so
 * the same request shaping works everywhere. Base URLs can be overridden with
 * GROQ_BASE_URL / OPENROUTER_BASE_URL / GEMINI_BASE_URL (proxies, or a local
 * OpenAI-compatible server in tests).
 */

import type { TabMode } from '@/types';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  label: string;
}

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const GROQ_DEFAULT_MODEL = 'openai/gpt-oss-120b';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_DEFAULT_MODEL = 'openrouter/auto';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai';
const GEMINI_DEFAULT_MODEL = 'gemini-3.8-flash';

function configured(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function firstListedModel(value: string | undefined): string | undefined {
  return value
    ?.split(',')
    .map((model) => model.trim())
    .find((model) => model.length > 0);
}

/** Providers that have a key, in the order they should be tried. */
function buildConfigs(): LlmConfig[] {
  const configs: LlmConfig[] = [];

  const groqKey = process.env.GROQ_API_KEY;
  if (configured(groqKey)) {
    configs.push({
      baseUrl: process.env.GROQ_BASE_URL || GROQ_BASE_URL,
      apiKey: groqKey,
      defaultModel: process.env.LLM_MODEL || GROQ_DEFAULT_MODEL,
      label: 'Groq',
    });
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (configured(openRouterKey)) {
    configs.push({
      baseUrl: process.env.OPENROUTER_BASE_URL || OPENROUTER_BASE_URL,
      apiKey: openRouterKey,
      defaultModel:
        process.env.OPENROUTER_MODEL ||
        firstListedModel(process.env.OPENROUTER_MODELS) ||
        OPENROUTER_DEFAULT_MODEL,
      label: 'OpenRouter',
    });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (configured(geminiKey)) {
    configs.push({
      baseUrl: process.env.GEMINI_BASE_URL || GEMINI_BASE_URL,
      apiKey: geminiKey,
      defaultModel: process.env.GEMINI_MODEL || GEMINI_DEFAULT_MODEL,
      label: 'Gemini',
    });
  }

  return configs;
}

function isRetryableError(status: number): boolean {
  if (status === 0) return true; // network error
  if (status === 429) return true; // rate limited
  if (status >= 500) return true; // server error
  if (status === 401 || status === 403) return true; // auth problem — try another provider
  return false;
}

function summarizeBody(body: unknown): string {
  if (body && typeof body === 'object' && 'error' in body) {
    const err = body as { error?: { message?: string; type?: string } };
    return err.error?.message ?? JSON.stringify(err.error);
  }
  if (typeof body === 'string') return body;
  return JSON.stringify(body);
}

/**
 * Call the configured LLM with a chat-style prompt and return the assistant text.
 */
export async function chat(
  messages: ChatMessage[],
  options: LlmOptions = {}
): Promise<string> {
  const configs = buildConfigs();

  if (configs.length === 0) {
    throw new Error(
      'No LLM provider configured. Set GROQ_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY in your environment.'
    );
  }

  let lastError: Error | null = null;

  for (const config of configs) {
    try {
      return await callProvider(config, messages, options);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const status = (error as { status?: number }).status ?? 0;

      if (!isRetryableError(status)) {
        // Non-retryable errors (e.g. a bad request) should surface immediately.
        throw error;
      }

      console.error(
        `LLM provider "${config.label}" failed (${status || 'network error'}); trying the next provider.`
      );
    }
  }

  throw lastError ?? new Error('LLM request failed');
}

async function callProvider(
  config: LlmConfig,
  messages: ChatMessage[],
  options: LlmOptions
): Promise<string> {
  const model = options.model || config.defaultModel;

  const body: Record<string, unknown> = {
    model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
  };

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const responseBody = await response.json().catch(() => ({})) as Record<string, unknown>;

  if (!response.ok) {
    const error = new Error(
      `LLM provider "${config.label}" failed: ${response.status} ${summarizeBody(responseBody)}`
    ) as Error & { status: number; body: unknown };
    error.status = response.status;
    error.body = responseBody;
    throw error;
  }

  const choices = responseBody.choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error(
      `LLM provider "${config.label}" returned an empty response: ${summarizeBody(responseBody)}`
    );
  }

  const content = (choices[0] as { message?: { content?: string } }).message?.content;
  if (typeof content !== 'string' || content.length === 0) {
    throw new Error(`LLM provider "${config.label}" returned an empty completion.`);
  }

  return content;
}

/**
 * Build a system prompt for a given tab mode. File context is passed through the
 * user message instead, so token use stays bounded and predictable.
 */
export function buildSystemPrompt(mode: TabMode): ChatMessage {
  const base =
    'You are a concise study assistant for a student preparing for the Philippine CPA board exam (Pinnacle review material).';
  let instruction = '';

  switch (mode) {
    case 'chat':
      instruction =
        'Answer study questions directly and briefly. When helpful, reference the CPA exam topics (FAR, AFAR, MS, AT, TAX, RFBT) and keep explanations focused on what a reviewer needs to know.';
      break;
    case 'notes':
      instruction =
        'Write clean, organized study notes. When review material is provided, base the notes on it and do not add information the material does not contain; otherwise write from CPA board exam knowledge following the instructions in the user message. Group related ideas under headings, use bullets for lists and steps, and highlight important terms, rules, and formulas.';
      break;
    case 'quiz':
      instruction =
        'Generate CPA board exam practice questions. Always use multiple choice with exactly four options labeled A-D and one correct answer — never true/false, essay, matching, or short-answer items. Follow any instructions in the user message about the subject, topic, number of items, difficulty, and mix. Present the questions and options first, then the answer key with a short explanation for each item, in plain text with clear numbering.';
      break;
  }

  const systemContent = `${base} ${instruction}`;
  return { role: 'system', content: systemContent };
}

/**
 * Build the user message for a tab mode from the uploaded file's pages. Quiz
 * mode without pages is handled by the built-in prompt builder in
 * src/lib/quiz-prompt.ts instead, so this only ever wraps real file context.
 */
export function buildUserMessage(
  mode: TabMode,
  userText: string,
  pages: { pageNumber: number; text: string }[]
): string {
  if (pages.length === 0) {
    return userText.trim();
  }

  const effectiveSource = pages;

  const contextLabel = mode === 'quiz' ? 'practice material' : 'review material';
  const sourceSection = effectiveSource
    .map(
      (p) =>
        `--- Page ${p.pageNumber} ---\n${p.text}`
    )
    .join('\n\n');

  const preamble =
    mode === 'quiz'
      ? `Use the following ${contextLabel} to generate practice questions. If the material is too short for the number of questions requested, produce as many as you reasonably can.\n\nSource material:\n\n`
      : `Use the following ${contextLabel} to write study notes.\n\nSource material:\n\n`;

  return `${preamble}${sourceSection}\n\n---\n\n${userText.trim()}`;
}
