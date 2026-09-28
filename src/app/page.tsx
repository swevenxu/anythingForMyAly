'use client';

import { useState, useEffect } from 'react';
import SubjectCard from '@/components/SubjectCard';
import type { DashboardStats, SubjectMastery } from '@/types';

function masteryFill(mastery: number, attemptCount: number) {
  if (attemptCount === 0) return 'var(--bg-elevated)';
  if (mastery >= 0.8) {
    return 'linear-gradient(90deg, var(--accent-emerald) 0%, #34d399 100%)';
  }
  if (mastery >= 0.5) {
    return 'linear-gradient(90deg, var(--accent-amber) 0%, #fbbf24 100%)';
  }
  return 'linear-gradient(90deg, var(--accent-rose) 0%, #f87171 100%)';
}

function subjectDetail(subject: SubjectMastery) {
  if (subject.attemptCount === 0) {
    return subject.quizCount > 0
      ? `${subject.quizCount} quiz question${subject.quizCount === 1 ? '' : 's'} ready`
      : 'No quizzes generated yet';
  }
  return `${subject.correctCount} of ${subject.attemptCount} quiz answers correct`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    subjects: [],
    weakSubjects: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/dashboard', { signal: AbortSignal.timeout(15000) });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="grid grid-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-card stat-card animate-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="skeleton" style={{ width: 48, height: 16, borderRadius: 'var(--radius-sm)' }} />
              <div className="skeleton" style={{ width: 112, height: 112, marginTop: 16, borderRadius: '50%' }} />
              <div className="skeleton" style={{ width: '40%', height: 14, marginTop: 16 }} />
              <div className="skeleton" style={{ width: '60%', height: 14, marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 'var(--space-8)' }}>
        {stats.subjects.map((subject, index) => (
          <SubjectCard key={subject.code} subject={subject} index={index} />
        ))}
      </div>

      {stats.weakSubjects.length > 0 && (
        <div className="animate-in animate-in-5">
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Subjects to Review</h2>
          <div className="grid grid-3">
            {stats.weakSubjects.map((subject) => (
              <div key={subject.code} className="glass-card" style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                    {subject.code} · {subject.name}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    {Math.round(subject.mastery * 100)}%
                  </span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${subject.mastery * 100}%`,
                      background: masteryFill(subject.mastery, subject.attemptCount),
                    }}
                  />
                </div>
                <div className="stat-detail" style={{ marginTop: 'var(--space-2)' }}>
                  {subject.correctCount}/{subject.attemptCount} correct
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.subjects.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-title">No subjects yet</div>
          <div className="empty-state-description">
            Run <code>npm run setup</code> to seed the Pinnacle CPA topics, then take some quizzes to
            see your mastery here.
          </div>
        </div>
      )}
    </div>
  );
}