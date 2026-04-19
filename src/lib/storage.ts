import type { AppSession, ChatMessage, Language } from "@/types";

const KEYS = {
  code: "companion:code",
  language: "companion:language",
  messages: "companion:messages",
  attemptCount: "companion:attemptCount",
  notes: "companion:notes",
  onboarded: "companion:onboarded",
} as const;

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — ignore
  }
}

export function loadSession(): AppSession {
  return {
    code: safeGet<string>(KEYS.code, ""),
    language: safeGet<Language>(KEYS.language, "javascript"),
    messages: safeGet<ChatMessage[]>(KEYS.messages, []),
    attemptCount: safeGet<number>(KEYS.attemptCount, 0),
    notes: safeGet<string>(KEYS.notes, ""),
    onboarded: safeGet<boolean>(KEYS.onboarded, false),
  };
}

export function saveCode(code: string): void {
  safeSet(KEYS.code, code);
}

export function saveLanguage(lang: Language): void {
  safeSet(KEYS.language, lang);
}

export function saveMessages(messages: ChatMessage[]): void {
  safeSet(KEYS.messages, messages);
}

export function saveAttemptCount(count: number): void {
  safeSet(KEYS.attemptCount, count);
}

export function saveNotes(notes: string): void {
  safeSet(KEYS.notes, notes);
}

export function markOnboarded(): void {
  safeSet(KEYS.onboarded, true);
}

export function resetSession(): void {
  Object.values(KEYS).forEach((k) => {
    if (typeof window !== "undefined") localStorage.removeItem(k);
  });
}
