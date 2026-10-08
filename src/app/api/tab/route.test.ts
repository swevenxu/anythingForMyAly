import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, test } from 'node:test';

/**
 * Route-level checks for the AI tab. A local OpenAI-compatible mock answers the
 * chat completions call, so these tests run without any real API key.
 */
let lastUserPrompt = '';
let mockServer: http.Server;

before(async () => {
  mockServer = http.createServer((request, response) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      const payload = JSON.parse(body || '{}') as {
        messages?: Array<{ role?: string; content?: string }>;
      };
      lastUserPrompt =
        payload.messages?.find((message) => message.role === 'user')?.content ?? '';

      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(
        JSON.stringify({
          choices: [{ index: 0, message: { role: 'assistant', content: 'MOCK ANSWER' } }],
        })
      );
    });
  });

  await new Promise<void>((resolve) => mockServer.listen(0, '127.0.0.1', resolve));
  const { port } = mockServer.address() as AddressInfo;

  process.env.OPENROUTER_API_KEY = 'test-key';
  process.env.OPENROUTER_BASE_URL = `http://127.0.0.1:${port}/v1`;
  process.env.OPENROUTER_MODEL = 'test-model';
  delete process.env.GROQ_API_KEY;
  delete process.env.GEMINI_API_KEY;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    mockServer.close((error) => (error ? reject(error) : resolve()));
  });

  delete process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_BASE_URL;
  delete process.env.OPENROUTER_MODEL;
});

async function postTab(body: unknown): Promise<Response> {
  const { POST } = await import('./route');
  const { NextRequest } = await import('next/server');

  return POST(
    new NextRequest('http://localhost/api/tab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

test('answers quiz mode from the built-in CPA prompt when no file is attached', async () => {
  lastUserPrompt = '';

  const response = await postTab({
    mode: 'quiz',
    message: 'Taxation quiz on VAT, 10 items, medium difficulty.',
  });

  assert.equal(response.status, 200);

  const data = (await response.json()) as { content?: string; usedFileContext?: boolean };
  assert.equal(data.content, 'MOCK ANSWER');
  assert.equal(data.usedFileContext, false);

  assert.match(lastUserPrompt, /experienced Philippine CPA board exam reviewer/);
  assert.match(lastUserPrompt, /Create 10 Taxation board-style multiple-choice questions only/);
  assert.match(lastUserPrompt, /on VAT\b/);
  assert.match(lastUserPrompt, /as of \d{4}/);
  assert.doesNotMatch(lastUserPrompt, /\[[^\]]*\]/);
  assert.doesNotMatch(lastUserPrompt, /Confirm, then wait/);
});

test('answers notes mode from the built-in notes prompt when no file is attached', async () => {
  lastUserPrompt = '';

  const response = await postTab({
    mode: 'notes',
    message: 'Study notes on PFRS 15 revenue recognition',
  });

  assert.equal(response.status, 200);

  const data = (await response.json()) as { content?: string; usedFileContext?: boolean };
  assert.equal(data.content, 'MOCK ANSWER');
  assert.equal(data.usedFileContext, false);

  assert.match(lastUserPrompt, /writing study notes for a reviewee/);
  assert.match(lastUserPrompt, /Subject: Financial Accounting and Reporting \(FAR\)/);
  assert.match(lastUserPrompt, /Requested topic: "Study notes on PFRS 15 revenue recognition"/);
  assert.doesNotMatch(lastUserPrompt, /Source material:/);
});

test('answers formula mode from the built-in formula prompt when no file is attached', async () => {
  lastUserPrompt = '';

  const response = await postTab({
    mode: 'formula',
    message: 'MAS formula guide on CVP analysis with worked examples',
  });

  assert.equal(response.status, 200);

  const data = (await response.json()) as { content?: string; usedFileContext?: boolean };
  assert.equal(data.content, 'MOCK ANSWER');
  assert.equal(data.usedFileContext, false);

  assert.match(lastUserPrompt, /creating a formula-identification quiz/);
  assert.match(lastUserPrompt, /Subject: Management Advisory Services \(MAS\)/);
  assert.match(lastUserPrompt, /CVP analysis/);
  assert.match(lastUserPrompt, /Formula-bank entries available/);
});

test('asks for a subject instead of guessing when the request names none', async () => {
  lastUserPrompt = '';

  const response = await postTab({ mode: 'quiz', message: 'Give me a quiz' });

  assert.equal(response.status, 200);
  assert.match(lastUserPrompt, /Ask which subject to quiz on/);
});

test('rejects quiz mode without a message', async () => {
  const response = await postTab({ mode: 'quiz' });
  assert.equal(response.status, 400);
});
