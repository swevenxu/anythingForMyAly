import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';
import { latestAttempts } from '@/lib/attempts';
import { PINNACLE_SUBJECTS } from '@/lib/pinnacle';
import type { DashboardStats, SubjectMastery } from '@/types';

export const dynamic = 'force-dynamic';

const emptyDashboard: DashboardStats = {
  subjects: PINNACLE_SUBJECTS.map((subject) => ({
    code: subject.code,
    name: subject.name,
    quizCount: 0,
    attemptCount: 0,
    correctCount: 0,
    mastery: 0,
    color: null,
  })),
  weakSubjects: [],
};

interface TopicRow {
  id: string;
  name: string;
  color: string;
}

interface QuestionRow {
  id: string;
  topic_id: string | null;
}

interface AttemptRow {
  question_id: string;
  is_correct: boolean;
  answered_at: string;
}

/**
 * Normalizes topic names so "auditing theory " or "Auditing Theory!" still
 * match a Pinnacle subject. Falls back to the subject code (e.g. "FAR").
 */
function matchesSubject(topicName: string, subjectName: string, subjectCode: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return norm(topicName) === norm(subjectName) || norm(topicName) === norm(subjectCode);
}

export async function GET() {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json(emptyDashboard);

  try {
    const [topicsRes, questionsRes, attemptsRes, quizzesRes] = await Promise.all([
      supabase.from('topics').select('id, name, color'),
      supabase.from('questions').select('id, topic_id').eq('format', 'multiple_choice'),
      supabase
        .from('attempt_log')
        .select('question_id, is_correct, answered_at')
        .order('answered_at', { ascending: false }),
      supabase.from('quizzes').select('topic_id').is('file_id', null).eq('format', 'multiple_choice'),
    ]);

    const databaseError = topicsRes.error || questionsRes.error || attemptsRes.error || quizzesRes.error;
    if (databaseError) {
      console.error('Dashboard API error:', databaseError);
      return NextResponse.json(emptyDashboard);
    }

    const topics = (topicsRes.data as TopicRow[]) || [];
    const questions = (questionsRes.data as QuestionRow[]) || [];
    const attempts = (attemptsRes.data as AttemptRow[]) || [];
    const quizzes = (quizzesRes.data as { topic_id: string | null }[]) || [];

    // topic id -> topic row (color lookup + name matching)
    const topicById = new Map<string, TopicRow>();
    for (const t of topics) topicById.set(t.id, t);

    // question id -> topic_id
    const qToTopic = new Map<string, string | null>();
    for (const q of questions) qToTopic.set(q.id, q.topic_id);

    // Use the same latest-answer rule as Review and Progress.
    const latest = new Map<string, { topic_id: string | null; is_correct: boolean }>();
    for (const a of latestAttempts(attempts).values()) {
      latest.set(a.question_id, {
        topic_id: qToTopic.get(a.question_id) ?? null,
        is_correct: a.is_correct,
      });
    }

    // aggregate attempted / correct per topic_id
    const perTopic = new Map<string, { attempted: number; correct: number }>();
    for (const { topic_id, is_correct } of latest.values()) {
      if (!topic_id) continue;
      const cur = perTopic.get(topic_id) || { attempted: 0, correct: 0 };
      cur.attempted += 1;
      if (is_correct) cur.correct += 1;
      perTopic.set(topic_id, cur);
    }

    // quiz count per topic_id
    const quizCountByTopic = new Map<string, number>();
    for (const q of quizzes) {
      if (!q.topic_id) continue;
      quizCountByTopic.set(q.topic_id, (quizCountByTopic.get(q.topic_id) || 0) + 1);
    }

    const subjects: SubjectMastery[] = PINNACLE_SUBJECTS.map((subject) => {
      // Match the topic row by exact/normalized name or subject code.
      const topicRow = topics.find((t) => matchesSubject(t.name, subject.name, subject.code));

      const attempted = topicRow ? perTopic.get(topicRow.id)?.attempted ?? 0 : 0;
      const correct = topicRow ? perTopic.get(topicRow.id)?.correct ?? 0 : 0;
      const quizCount = topicRow ? quizCountByTopic.get(topicRow.id) ?? 0 : 0;
      const mastery = attempted === 0 ? 0 : correct / attempted;

      return {
        code: subject.code,
        name: subject.name,
        quizCount,
        attemptCount: attempted,
        correctCount: correct,
        mastery,
        color: topicRow?.color ?? null,
      };
    });

    const weakSubjects = subjects
      .filter((s) => s.attemptCount > 0 && s.mastery < 0.7)
      .sort((a, b) => a.mastery - b.mastery);

    return NextResponse.json({ subjects, weakSubjects } satisfies DashboardStats);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(emptyDashboard);
  }
}
