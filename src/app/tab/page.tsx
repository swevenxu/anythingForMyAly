'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, AlertCircle, Trash2 } from 'lucide-react';
import type { TabMode, TabMessage } from '@/types';
import styles from './page.module.css';
import MarkdownMessage from '@/components/MarkdownMessage';
import QuizMessage from '@/components/QuizMessage';

// Free-form chat lives in the floating bubble (see FloatingChat); this page runs
// the built-in notes and quiz generation, which work from the typed request.
type TabPageMode = Exclude<TabMode, 'chat'>;

const MODE_LABELS: Record<TabPageMode, string> = {
  notes: 'Generate notes',
  quiz: 'Generate quiz',
};

const MODE_DESCRIPTIONS: Record<TabPageMode, string> = {
  notes: 'Board-style study notes on any topic.',
  quiz: 'AI-generated board-style practice questions.',
};

const QUICK_PROMPTS: Record<TabPageMode, Array<{ label: string; prompt: string }>> = {
  notes: [
    { label: 'PAS 12 deferred tax', prompt: 'Create study notes on PAS 12 income taxes and deferred tax.' },
    { label: 'PFRS 15 revenue', prompt: 'Create study notes on PFRS 15 revenue recognition and its five-step model.' },
    { label: 'VAT & percentage tax', prompt: 'Create study notes on VAT and percentage tax for the 2026 CPA exam.' },
    { label: 'PSA 315 risk', prompt: 'Create study notes on PSA 315 risk assessment.' },
    { label: 'CVP analysis', prompt: 'Create study notes on cost-volume-profit analysis with the formulas.' },
    { label: 'Obligations & contracts', prompt: 'Create study notes on obligations and contracts under the Civil Code.' },
  ],
  quiz: [
    { label: 'FAR', prompt: 'FAR quiz on income taxes (PAS 12) and deferred tax, 10 items, medium difficulty.' },
    { label: 'AFAR', prompt: 'AFAR quiz on business combinations and consolidation, 8 items.' },
    { label: 'MAS', prompt: 'MAS quiz on CVP analysis and variance analysis, 10 items.' },
    { label: 'Auditing Theory', prompt: 'Auditing theory quiz on audit evidence and sampling, 15 items.' },
    { label: 'Taxation', prompt: 'Taxation quiz on VAT and percentage tax, 10 items, medium difficulty.' },
    { label: 'RFBT', prompt: 'RFBT quiz on obligations and contracts, 15 items, hard difficulty.' },
  ],
};

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default function AiTabPage() {
  const [messages, setMessages] = useState<TabMessage[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<TabPageMode>('notes');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presence, setPresence] = useState<'idle' | 'thinking'>('idle');

  const listEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to the latest message.
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, presence]);

  function selectMode(nextMode: TabPageMode) {
    setMode(nextMode);
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setError(null);

    const userMessage: TabMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      mode,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSending(true);
    setPresence('thinking');

    try {
      const res = await fetch('/api/tab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, message: text }),
        signal: AbortSignal.timeout(60000),
      });

      const data = await res.json().catch(() => ({})) as { error?: string; content?: string };

      if (!res.ok || data.error) {
        setError(data.error ?? 'The AI assistant could not respond. Please try again.');
        setPresence('idle');
        setSending(false);
        return;
      }

      const assistantMessage: TabMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.content ?? '',
        mode,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setSending(false);
      setPresence('idle');
      // Keep focus on the input for rapid follow-ups.
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function clearChat() {
    if (messages.length === 0) return;
    setMessages([]);
    setError(null);
    setPresence('idle');
  }

  return (
    <div className={`page-container ${styles['ai-tab-container']} animate-in`}>
      <div className="page-header">
        <div className="ai-tab-header-row">
          <div>
            <h1 className="page-title">AI Study Tools</h1>
          </div>
        </div>
      </div>

      {/* Mode selector */}
      <div className={styles['ai-mode-tabs']} role="tablist" aria-label="AI mode">
        {(Object.keys(MODE_LABELS) as TabPageMode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            className={`${styles['ai-mode-tab']} ${mode === m ? styles.active : ''}`}
            onClick={() => selectMode(m)}
          >
            <span className={styles['ai-mode-label']}>{MODE_LABELS[m]}</span>
            <span className={styles['ai-mode-desc']}>{MODE_DESCRIPTIONS[m]}</span>
          </button>
        ))}
      </div>

      {/* Quick-start prompts for the built-in notes and quiz generation */}
      {!sending && (
        <div className={styles['ai-suggestions']}>
          <span className={styles['ai-suggestions-label']}>Quick start</span>
          <div className={styles['ai-suggestion-chips']}>
            {QUICK_PROMPTS[mode].map((suggestion) => (
              <button
                key={suggestion.label}
                type="button"
                className={styles['ai-suggestion-chip']}
                onClick={() => {
                  setInput(suggestion.prompt);
                  inputRef.current?.focus();
                }}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className={styles['ai-error']} role="alert">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className={styles['ai-chat-shell']}>
        {/* Message list */}
        <div className={styles['ai-message-list']} aria-live="polite" aria-label="Conversation">
          {messages.length === 0 && presence === 'idle' && (
            <div className={styles['ai-empty']}>
              <Sparkles size={36} className={styles['ai-empty-icon']} />
              <p className={styles['ai-empty-title']}>Start a conversation</p>
              <p className={styles['ai-empty-desc']}>
                {mode === 'quiz'
                  ? 'Ask for a quiz on any CPA subject — for example "Taxation quiz on VAT, 10 items, medium difficulty". No file needed.'
                  : 'Ask for notes on any CPA topic — for example "PAS 12 deferred tax", or how PFRS 15 revenue recognition works.'}
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`${styles['ai-message']} ${styles[`ai-message-${msg.role}`]}`}>
              <div className={styles['ai-message-meta']}>
                <span className={styles['ai-message-role']}>
                  {msg.role === 'user' ? 'You' : 'Assistant'}
                </span>
              </div>
              <div className={styles['ai-message-bubble']}>
                {msg.role === 'assistant' ? (
                  msg.mode === 'quiz' ? (
                    <QuizMessage content={msg.content} />
                  ) : (
                    <MarkdownMessage content={msg.content} />
                  )
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className={`${styles['ai-message']} ${styles['ai-message-assistant']} ${styles['ai-message-sending']}`}>
              <div className={`${styles['ai-message-bubble']} ${styles['ai-thinking']}`}>
                <span className={styles['ai-thinking-dots']} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </div>
          )}

          <div ref={listEndRef} />
        </div>

        {/* Input */}
        <div className={styles['ai-input-row']}>
          <textarea
            ref={inputRef}
            className={styles['ai-input']}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending || presence === 'thinking'}
            rows={2}
            aria-label="Message"
          />
          <button
            className={`btn btn-primary ${styles['ai-send-btn']}`}
            onClick={send}
            disabled={!input.trim() || sending}
            aria-label="Send message"
          >
            <Send size={15} />
            Send
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              className={`btn btn-secondary ${styles['ai-clear-btn']}`}
              onClick={clearChat}
              disabled={sending}
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <Trash2 size={15} />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
