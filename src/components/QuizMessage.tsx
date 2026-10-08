'use client';

import { useMemo, useState } from 'react';
import MarkdownMessage from './MarkdownMessage';

interface QuizItem {
  number: number;
  question: string;
  options: { label: string; text: string }[];
  answer?: string;
  explanation?: string;
}

function parseQuiz(content: string): QuizItem[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const answerKeyIndex = lines.findIndex((line) => /answer\s*key/i.test(line));
  const questionLines = answerKeyIndex >= 0 ? lines.slice(0, answerKeyIndex) : lines;
  const answerLines = answerKeyIndex >= 0 ? lines.slice(answerKeyIndex + 1) : [];
  const items: QuizItem[] = [];
  let current: QuizItem | null = null;

  for (const line of questionLines) {
    const normalizedLine = line.trim().replace(/\*\*/g, '');
    const questionMatch = normalizedLine.match(/^(\d+)[.)]\s+(.+)$/);
    const optionMatch = normalizedLine.match(/^(?:[-*]\s*)?([A-D])[.)：:]\s+(.+)$/i);

    if (questionMatch) {
      current = {
        number: Number(questionMatch[1]),
        question: questionMatch[2].trim(),
        options: [],
      };
      items.push(current);
    } else if (current && optionMatch) {
      current.options.push({ label: optionMatch[1].toUpperCase(), text: optionMatch[2].trim() });
    } else if (current && line.trim() && current.options.length === 0) {
      current.question += ` ${line.trim()}`;
    }
  }

  for (const line of answerLines) {
    const answerMatch = line
      .trim()
      .replace(/\*\*/g, '')
      .match(/^(\d+)[.)]\s*([A-D])(?:\s*[-:.)—–]\s*(.*))?$/i);
    if (!answerMatch) continue;
    const item = items.find((entry) => entry.number === Number(answerMatch[1]));
    if (item) {
      item.answer = answerMatch[2].toUpperCase();
      item.explanation = answerMatch[3]?.trim();
    }
  }

  return items.filter((item) => item.options.length >= 2);
}

export default function QuizMessage({ content }: { content: string }) {
  const items = useMemo(() => parseQuiz(content), [content]);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  if (items.length === 0) return <MarkdownMessage content={content} />;

  return (
    <div className="quiz-message">
      {items.map((item) => {
        const selected = answers[item.number];
        const answered = Boolean(selected);
        return (
          <article className="quiz-card glass-card" key={item.number}>
            <p className="quiz-card-question">
              {item.number}. <MarkdownMessage content={item.question} />
            </p>
            <div>
              {item.options.map((option) => {
                const isCorrect = answered && option.label === item.answer;
                const isIncorrect = answered && option.label === selected && option.label !== item.answer;
                const className = [
                  'quiz-option',
                  option.label === selected ? 'selected' : '',
                  isCorrect ? 'correct' : '',
                  isIncorrect ? 'incorrect' : '',
                ].filter(Boolean).join(' ');

                return (
                  <button
                    type="button"
                    className={className}
                    key={option.label}
                    onClick={() => {
                      if (!answered) setAnswers((previous) => ({ ...previous, [item.number]: option.label }));
                    }}
                    disabled={answered}
                  >
                    <span className="quiz-option-label">{option.label}</span>
                    <span><MarkdownMessage content={option.text} /></span>
                  </button>
                );
              })}
            </div>
            {answered && item.explanation && (
              <p className="quiz-message-explanation">
                <strong>Explanation:</strong> {item.explanation}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
