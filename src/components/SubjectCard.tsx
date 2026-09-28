'use client';

import MasteryRing from './MasteryRing';
import type { SubjectMastery } from '@/types';

/** Ring / accent color: topic color when seeded, fallback thresholds otherwise. */
function cardColor(subject: SubjectMastery): string {
  if (subject.attemptCount === 0) return 'var(--text-muted)';
  if (subject.color) return subject.color;
  if (subject.mastery >= 0.8) return 'var(--accent-emerald)';
  if (subject.mastery >= 0.5) return 'var(--accent-amber)';
  return 'var(--accent-rose)';
}

interface SubjectCardProps {
  subject: SubjectMastery;
  index?: number;
}

/**
 * Dashboard subject card matching the Figma design:
 * subject code, mastery ring with % in the middle, correct/total counts.
 */
export default function SubjectCard({ subject, index = 0 }: SubjectCardProps) {
  const percent = Math.round(subject.mastery * 100);
  const color = cardColor(subject);
  const hasAttempts = subject.attemptCount > 0;

  return (
    <div className="glass-card subject-card animate-in" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="subject-card-header">{subject.code.toLowerCase()}</div>

      <div className="subject-card-body">
        <MasteryRing mastery={subject.mastery} color={color} dim={!hasAttempts}>
          <span className="subject-card-percent" style={{ color: hasAttempts ? color : 'var(--text-muted)' }}>
            {hasAttempts ? `${percent}%` : '—'}
          </span>
        </MasteryRing>

        <div className="subject-card-stats">
          <div className="subject-card-stat-numbers">
            <span style={{ color: hasAttempts ? color : 'var(--text-muted)' }}>
              {hasAttempts ? subject.correctCount : '–'}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {hasAttempts ? subject.attemptCount : '–'}
            </span>
          </div>
          <div className="subject-card-stat-labels">
            <span>correct</span>
            <span>total</span>
          </div>
        </div>
      </div>

      <div className="subject-card-name">{subject.name}</div>
    </div>
  );
}
