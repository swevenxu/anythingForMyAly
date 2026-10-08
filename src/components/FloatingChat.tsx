'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AlertCircle, Send, Sparkles, Trash2, X } from 'lucide-react';
import type { TabMessage } from '@/types';
import styles from './FloatingChat.module.css';
import MarkdownMessage from './MarkdownMessage';

const STARTER_PROMPTS = [
  'Explain deferred tax in simple terms.',
  'Quiz me on FAR: PAS 12, 5 items.',
  'Absorption vs variable costing — what is the difference?',
];

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ============================================================
// Session store
//
// The widget is mounted in the root layout, so its state normally survives
// client-side route changes. Mirroring it into sessionStorage also keeps the
// conversation when a page is fully reloaded. Backed by useSyncExternalStore so
// the server render stays deterministic (empty) and hydration is safe.
// ============================================================

const STORAGE_KEY = 'study-hub:study-assistant';

interface ChatState {
  open: boolean;
  messages: TabMessage[];
}

const EMPTY_STATE: ChatState = { open: false, messages: [] };

let cachedState: ChatState | null = null;
const listeners = new Set<() => void>();

function parseStoredState(raw: string | null): ChatState {
  if (!raw) return EMPTY_STATE;

  const parsed = JSON.parse(raw) as Partial<ChatState>;
  const messages = Array.isArray(parsed.messages)
    ? parsed.messages.filter(
        (message): message is TabMessage =>
          Boolean(message) &&
          typeof message.id === 'string' &&
          typeof message.content === 'string' &&
          (message.role === 'user' || message.role === 'assistant')
      )
    : [];

  return { open: parsed.open === true, messages };
}

function readState(): ChatState {
  if (cachedState) return cachedState;

  try {
    cachedState = parseStoredState(window.sessionStorage.getItem(STORAGE_KEY));
  } catch {
    cachedState = EMPTY_STATE;
  }

  return cachedState;
}

function writeState(next: ChatState): void {
  cachedState = next;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode or a full quota should not break the chat.
  }

  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getServerSnapshot(): ChatState {
  return EMPTY_STATE;
}

// ============================================================

/**
 * Corner chat bubble rendered from the root layout, so the assistant is one
 * click away on every page. Chat lives here; the AI tab handles file-based
 * summaries, notes, and quiz generation.
 */
export default function FloatingChat() {
  const { open, messages } = useSyncExternalStore(subscribe, readState, getServerSnapshot);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages, sending, open]);

  // Focus the composer on open and let Escape close the panel.
  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') writeState({ open: false, messages: readState().messages });
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  function setOpen(nextOpen: boolean) {
    // Read the store at write time so an in-flight request's closure cannot
    // overwrite messages added while it was waiting.
    writeState({ open: nextOpen, messages: readState().messages });
  }

  function appendMessage(message: TabMessage) {
    const current = readState();
    writeState({ open: true, messages: [...current.messages, message] });
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setError(null);
    appendMessage({
      id: generateId(),
      role: 'user',
      content: text,
      mode: 'chat',
      createdAt: Date.now(),
    });
    setSending(true);

    try {
      const res = await fetch('/api/tab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'chat', message: text }),
        signal: AbortSignal.timeout(60000),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        content?: string;
      };

      if (!res.ok || data.error) {
        setError(data.error ?? 'The assistant could not respond. Please try again.');
        return;
      }

      appendMessage({
        id: generateId(),
        role: 'assistant',
        content: data.content ?? '',
        mode: 'chat',
        createdAt: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setSending(false);
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
    writeState({ open: true, messages: [] });
    setError(null);
  }

  if (!open) {
    return (
      <button
        type="button"
        className={`${styles['chat-launcher']} ${styles['chat-launcher-closed']}`}
        onClick={() => setOpen(true)}
        aria-label="Open study assistant chat"
        title="Ask the study assistant"
      >
        <Sparkles size={22} />
      </button>
    );
  }

  return (
    <section
      className={styles['chat-panel']}
      role="dialog"
      aria-label="Study assistant chat"
    >
      <header className={styles['chat-header']}>
        <div className={styles['chat-header-title-row']}>
          <Sparkles size={18} />
          <div className={styles['chat-header-copy']}>
            <span className={styles['chat-title']}>Study assistant</span>
            <span className={styles['chat-subtitle']}>Ask about any CPA subject</span>
          </div>
        </div>
        <div className={styles['chat-header-actions']}>
          {messages.length > 0 && (
            <button
              type="button"
              className={styles['chat-icon-btn']}
              onClick={clearChat}
              aria-label="Clear chat"
              title="Clear chat"
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            type="button"
            className={styles['chat-icon-btn']}
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      <div className={styles['chat-messages']} aria-live="polite">
        {messages.length === 0 && (
          <div className={styles['chat-intro']}>
            <p className={styles['chat-intro-title']}>Hi! What are we studying?</p>
            <p className={styles['chat-intro-text']}>
              Ask a question, or start with one of these:
            </p>
            <div className={styles['chat-suggestions']}>
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className={styles['chat-suggestion']}
                  onClick={() => {
                    setInput(prompt);
                    inputRef.current?.focus();
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles['chat-message']} ${styles[`chat-message-${message.role}`]}`}
          >
            <div className={styles['chat-bubble']}>
              {message.role === 'assistant' ? (
                <MarkdownMessage content={message.content} />
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className={`${styles['chat-message']} ${styles['chat-message-assistant']}`}>
            <div className={`${styles['chat-bubble']} ${styles['chat-thinking']}`}>
              <span className={styles['chat-thinking-dots']} aria-label="Assistant is responding">
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {error && (
        <div className={styles['chat-error']} role="alert">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className={styles['chat-composer']}>
        <textarea
          ref={inputRef}
          className={styles['chat-input']}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          rows={1}
          aria-label="Chat message"
        />
        <button
          type="button"
          className={`btn btn-primary ${styles['chat-send-btn']}`}
          onClick={send}
          disabled={!input.trim() || sending}
          aria-label="Send chat message"
        >
          <Send size={15} />
        </button>
      </div>
    </section>
  );
}
