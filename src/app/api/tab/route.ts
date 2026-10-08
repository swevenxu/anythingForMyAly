import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';
import { validateRequestBody } from '@/lib/api-utils';
import { tabRequestSchema } from '@/lib/validation';
import { chat, buildSystemPrompt, buildUserMessage, type ChatMessage } from '@/lib/llm';
import { buildQuizPrompt } from '@/lib/quiz-prompt';
import { buildNotesPrompt } from '@/lib/notes-prompt';
import type { TabResponse, PageText } from '@/types';

export const dynamic = 'force-dynamic';

function pageRowToText(row: {
  page_number: number;
  raw_text: string | null;
  ocr_text: string | null;
}): PageText | null {
  const text = row.raw_text || row.ocr_text;
  if (!text || text.trim().length === 0) return null;
  return { pageNumber: row.page_number, text: text.trim() };
}

type ServerSupabase = NonNullable<ReturnType<typeof getServerSupabase>>;

async function fetchPagesForFile(supabase: ServerSupabase, fileId: string): Promise<PageText[]> {
  const { data, error } = await supabase
    .from('pages')
    .select('page_number, raw_text, ocr_text')
    .eq('file_id', fileId)
    .order('page_number', { ascending: true });

  if (error) {
    throw new Error(`Failed to load pages for file ${fileId}: ${error.message}`);
  }

  const pages: PageText[] = [];
  if (Array.isArray(data)) {
    for (const row of data) {
      const pt = pageRowToText(row);
      if (pt) pages.push(pt);
    }
  }

  return pages;
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();

  const validation = await validateRequestBody(request, tabRequestSchema);
  if (!validation.success) {
    return validation.response;
  }

  const { mode, message, fileId } = validation.data;

  // For file-context modes, require a message.
  if (mode !== 'chat' && !message) {
    return NextResponse.json(
      { error: 'A message is required for this mode.' },
      { status: 400 }
    );
  }

  // Fetch file context if a file ID was provided.
  let pages: PageText[] = [];
  let usedFileContext = false;

  if (fileId) {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Study Hub is not configured. Connect Supabase to use file context.' },
        { status: 503 }
      );
    }

    try {
      pages = await fetchPagesForFile(supabase, fileId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }

    if (pages.length === 0) {
      return NextResponse.json(
        {
          error:
            'This file has no extracted text yet. Verify and extract the file before using it with the AI tab.',
        },
        { status: 422 }
      );
    }

    usedFileContext = true;
  }

  const userText = message || (mode === 'chat' ? 'Hello, how can you help me study today?' : '');

  // Without an attached file, quiz and notes both run from built-in prompts
  // instead of uploaded material: quizzes from cpa-quiz-prompts.md, notes from
  // src/lib/notes-prompt.ts.
  let builtInPrompt: string | undefined;
  if (pages.length === 0) {
    if (mode === 'quiz') builtInPrompt = buildQuizPrompt(userText);
    else if (mode === 'notes') builtInPrompt = buildNotesPrompt(userText);
  }

  if (mode === 'quiz' && pages.length === 0 && !builtInPrompt) {
    return NextResponse.json(
      {
        error:
          'Quiz generation is not available right now. Check that cpa-quiz-prompts.md is present, or set CPA_QUIZ_PROMPTS_PATH.',
      },
      { status: 503 }
    );
  }

  const systemMessage = buildSystemPrompt(mode);
  const userMessage = builtInPrompt ?? buildUserMessage(mode, userText, pages);

  const messages: ChatMessage[] = [systemMessage, { role: 'user', content: userMessage }];

  let assistantContent: string;
  try {
    assistantContent = await chat(messages, {
      maxTokens: mode === 'quiz' ? 8192 : 4096,
      temperature: mode === 'quiz' ? 0.4 : mode === 'notes' ? 0.5 : 0.7,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('AI tab LLM error:', message);
    return NextResponse.json(
      {
        error:
          'The AI assistant could not respond. Check that your LLM API keys are configured and try again.',
        details: message,
      },
      { status: 502 }
    );
  }

  const response: TabResponse = {
    role: 'assistant',
    content: assistantContent,
    usedFileContext,
  };

  return NextResponse.json(response);
}
