import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';
import { evaluateCompletion } from '@/lib/completion-check';

export const dynamic = 'force-dynamic';

interface AttemptRow {
  question_id: string;
  is_correct: boolean;
  answered_at: string;
}

interface QuestionRow {
  id: string;
  topic_id: string | null;
}

interface TopicRow {
  id: string;
  name: string;
}

/**
 * Returns { allComplete: true } only when:
 * 1. Every quiz has been answered (none remaining in the quiz pool)
 * 2. Every wrong answer has been corrected (no review items left)
 * 3. Every subject has 100% mastery on the dashboard
 */
export async function GET() {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ allComplete: false });

  try {
    const [quizzesRes, questionsRes, attemptsRes, topicsRes] = await Promise.all([
      supabase
        .from('quizzes')
        .select('question, options')
        .is('file_id', null)
        .eq('format', 'multiple_choice'),
      supabase
        .from('questions')
        .select('id, topic_id')
        .eq('format', 'multiple_choice'),
      supabase
        .from('attempt_log')
        .select('question_id, is_correct, answered_at')
        .order('answered_at', { ascending: false }),
      supabase.from('topics').select('id, name'),
    ]);

    if (quizzesRes.error || questionsRes.error || attemptsRes.error || topicsRes.error) {
      return NextResponse.json({ allComplete: false });
    }

    const quizzes = (quizzesRes.data || []) as { question: string; options: unknown }[];
    const questions = (questionsRes.data || []) as QuestionRow[];
    const attempts = (attemptsRes.data || []) as AttemptRow[];
    const topics = (topicsRes.data || []) as TopicRow[];

    return NextResponse.json(
      evaluateCompletion({ quizzes, questions, attempts, topics }),
    );
  } catch {
    return NextResponse.json({ allComplete: false });
  }
}
