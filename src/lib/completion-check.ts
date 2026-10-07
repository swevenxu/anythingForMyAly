import { isMultipleChoiceOptions } from './mcq';
import { questionHash } from './question-hash';
import { latestAttempts, type TimestampedAttempt } from './attempts';
import { PINNACLE_SUBJECTS } from './pinnacle';

/**
 * Pure aggregation/decision logic for the completion check (the "all done"
 * congrats message). The API route fetches raw Supabase rows and passes them
 * in; keeping the decision logic pure makes every edge case testable.
 */

export interface CompletionQuizRow {
  question: string;
  options: unknown;
}

export interface CompletionQuestionRow {
  id: string;
  topic_id: string | null;
}

export interface CompletionTopicRow {
  id: string;
  name: string;
}

export interface CompletionInput {
  quizzes: readonly CompletionQuizRow[];
  questions: readonly CompletionQuestionRow[];
  attempts: readonly TimestampedAttempt[];
  topics: readonly CompletionTopicRow[];
}

/**
 * Checks, in order:
 * 1. Every pool quiz has an attempt (keyed by normalized-text question hash).
 * 2. No question's latest attempt is wrong.
 * 3. Every Pinnacle subject topic exists and is at 100% mastery
 *    (at least one attempt, all of them correct).
 */
export function evaluateCompletion(input: CompletionInput): { allComplete: boolean } {
  // --- Check 1: any unanswered pool quiz? ---
  const attemptedIds = new Set(input.attempts.map((a) => a.question_id));
  const hasUnanswered = input.quizzes.some(
    (q) => isMultipleChoiceOptions(q.options)
      && !attemptedIds.has(questionHash(q.question)),
  );
  if (hasUnanswered) return { allComplete: false };

  // --- Check 2: any question whose latest answer is wrong? ---
  const latest = latestAttempts(input.attempts);
  for (const a of latest.values()) {
    if (!a.is_correct) return { allComplete: false };
  }

  // --- Check 3: every Pinnacle subject at 100% mastery ---
  const topicIdByName = new Map(input.topics.map((t) => [t.name, t.id]));
  const topicIdByQuestion = new Map(input.questions.map((q) => [q.id, q.topic_id]));

  const perTopic = new Map<string, { attempted: number; correct: number }>();
  for (const a of latest.values()) {
    const topicId = topicIdByQuestion.get(a.question_id);
    if (!topicId) continue;
    const cur = perTopic.get(topicId) || { attempted: 0, correct: 0 };
    cur.attempted += 1;
    if (a.is_correct) cur.correct += 1;
    perTopic.set(topicId, cur);
  }

  for (const subject of PINNACLE_SUBJECTS) {
    const topicId = topicIdByName.get(subject.name);
    if (!topicId) return { allComplete: false };
    const stats = perTopic.get(topicId);
    if (!stats || stats.attempted === 0 || stats.correct < stats.attempted) {
      return { allComplete: false };
    }
  }

  return { allComplete: true };
}
