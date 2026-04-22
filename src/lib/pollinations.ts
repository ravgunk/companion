/**
 * Shared Pollinations AI helpers used by all three API routes.
 *
 * Pollinations returns one of several wrapper shapes depending on the model/version:
 *   { role, reasoning_content }          ← currently observed in production
 *   { choices: [{ message: { content } }] }  ← OpenAI-compatible envelope
 *   { content: [{ text }] }              ← Anthropic-compatible envelope
 *   plain text string                    ← simplest case
 *
 * extractText() handles all of these and returns the raw content string.
 * extractJSON() then pulls a typed object out of that string using three fallback
 * strategies so markdown fences and leading prose don't cause silent failures.
 */

export async function callPollinations(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const res = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model: "openai", stream: false }),
  });
  if (!res.ok) throw new Error(`Pollinations error ${res.status}: ${await res.text()}`);
  return res.text();
}

/**
 * Unwrap whatever envelope Pollinations sent and return the plain content string.
 */
export function extractText(raw: string): string {
  const trimmed = raw.trim();

  try {
    const outer = JSON.parse(trimmed) as Record<string, unknown>;

    // ── Shape 1: { role, reasoning_content } ──────────────────────────────
    if (typeof outer.reasoning_content === "string" && outer.reasoning_content) {
      console.log("[pollinations] extracted from reasoning_content");
      return outer.reasoning_content;
    }

    // ── Shape 2: OpenAI { choices: [{ message: { content } }] } ──────────
    const choices = outer.choices as Array<{ message?: { content?: string } }> | undefined;
    if (choices?.[0]?.message?.content) {
      console.log("[pollinations] extracted from choices[0].message.content");
      return choices[0].message.content;
    }

    // ── Shape 3: Anthropic { content: [{ text }] } ───────────────────────
    const content = outer.content as Array<{ text?: string }> | undefined;
    if (content?.[0]?.text) {
      console.log("[pollinations] extracted from content[0].text");
      return content[0].text;
    }

    // ── Shape 4: envelope has a plain "content" string ────────────────────
    if (typeof outer.content === "string" && outer.content) {
      console.log("[pollinations] extracted from content string");
      return outer.content;
    }
  } catch {
    // Not a JSON envelope — the raw text IS the content (plain string response)
  }

  console.log("[pollinations] using raw text as-is");
  return trimmed;
}

/**
 * Pull a typed JSON object out of a content string.
 * Tries three strategies so markdown fences / prose preambles don't break parsing.
 */
export function extractJSON<T>(text: string, label: string): T {
  const trimmed = text.trim();
  console.log(`[pollinations:${label}] content (first 400 chars):`, trimmed.slice(0, 400));

  // Strategy 1: direct parse (works when model returns clean JSON)
  try {
    return JSON.parse(trimmed) as T;
  } catch {}

  // Strategy 2: strip ALL markdown fences anywhere in the string
  const noFences = trimmed.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(noFences) as T;
  } catch {}

  // Strategy 3: regex — grab the first complete {...} block
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]) as T;
    } catch {}
  }

  throw new Error(
    `[${label}] Could not extract JSON from content. First 300 chars: ${trimmed.slice(0, 300)}`
  );
}
