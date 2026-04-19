import type { AnalysisResult, ChatMessage, Language, ProblemsResult, Concept } from "@/types";

export async function analyzeCode(
  code: string,
  language: Language
): Promise<AnalysisResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? "Analysis failed");
  }
  return res.json();
}

export async function generateProblems(
  concepts: Concept[],
  language: Language
): Promise<ProblemsResult> {
  const res = await fetch("/api/generate-problems", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ concepts, language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? "Problem generation failed");
  }
  return res.json();
}

export async function sendChatMessage(
  messages: ChatMessage[],
  attemptCount: number
): Promise<{ reply: string; attemptCount: number }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, attemptCount }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? "Chat failed");
  }
  return res.json();
}
