import { NextRequest, NextResponse } from "next/server";
import { PROBLEM_GENERATOR_PROMPT } from "@/lib/prompts";
import type { Concept, ProblemsResult } from "@/types";

async function callPollinations(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const res = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model: "openai", stream: false }),
  });
  if (!res.ok) throw new Error(`Pollinations error: ${res.status}`);
  return res.text();
}

/**
 * Tries three strategies to pull a ProblemsResult out of whatever Pollinations returns:
 * 1. Direct JSON.parse (works when model returns clean JSON)
 * 2. Strip all markdown fences, then parse (works when model wraps in ```json ... ```)
 * 3. Slice from first { to last } (works when model adds prose before/after the JSON)
 *
 * Also handles the case where Pollinations returns an OpenAI-envelope object
 * { choices: [{ message: { content: "..." } }] } — we extract the content string first.
 */
function extractProblemsResult(raw: string): ProblemsResult {
  // Try to unwrap an OpenAI-style envelope first
  let text = raw.trim();
  try {
    const envelope = JSON.parse(text) as Record<string, unknown>;
    const choices = envelope?.choices as Array<{ message?: { content?: string } }> | undefined;
    if (choices?.[0]?.message?.content) {
      text = choices[0].message.content;
    }
  } catch {
    // not an envelope — use raw text as-is
  }

  console.log("[generate-problems] raw Pollinations text (first 500 chars):", text.slice(0, 500));

  // Strategy 1: direct parse
  try {
    const parsed = JSON.parse(text) as ProblemsResult;
    if (parsed?.problems) return parsed;
  } catch {}

  // Strategy 2: strip ALL markdown fences (not just leading/trailing)
  const noFences = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
  try {
    const parsed = JSON.parse(noFences) as ProblemsResult;
    if (parsed?.problems) return parsed;
  } catch {}

  // Strategy 3: extract the first {...} block (handles prose before/after JSON)
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    const jsonSlice = text.slice(start, end + 1);
    try {
      const parsed = JSON.parse(jsonSlice) as ProblemsResult;
      if (parsed?.problems) return parsed;
    } catch {}
  }

  throw new Error(
    `Could not extract valid JSON from Pollinations response. First 300 chars: ${text.slice(0, 300)}`
  );
}

export async function POST(req: NextRequest) {
  try {
    const { concepts, language } = (await req.json()) as {
      concepts: Concept[];
      language: string;
    };

    if (!concepts?.length) {
      return NextResponse.json({ error: "No concepts provided" }, { status: 400 });
    }

    const conceptList = concepts
      .map((c) => `- ${c.name} (${c.category}, ${c.difficulty})`)
      .join("\n");

    const messages = [
      { role: "system", content: PROBLEM_GENERATOR_PROMPT },
      {
        role: "user",
        content: `Language: ${language}\n\nDetected concepts:\n${conceptList}\n\nGenerate 3 graded practice problems. Return ONLY the JSON object, no markdown, no prose.`,
      },
    ];

    // First attempt
    let raw: string;
    try {
      raw = await callPollinations(messages);
    } catch {
      raw = await callPollinations(messages); // retry on network error
    }

    let result: ProblemsResult;
    try {
      result = extractProblemsResult(raw);
    } catch (parseErr) {
      console.warn("[generate-problems] first parse failed, retrying:", parseErr);
      const retryMessages = [
        ...messages,
        { role: "assistant", content: raw },
        {
          role: "user",
          content:
            "Return ONLY the JSON object. No markdown fences, no explanatory text. Start your response with { and end with }.",
        },
      ];
      const retryRaw = await callPollinations(retryMessages);
      result = extractProblemsResult(retryRaw);
    }

    // Guarantee the problems array exists
    if (!Array.isArray(result.problems)) {
      result.problems = [];
    }

    console.log("[generate-problems] success — problem count:", result.problems.length);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[generate-problems] fatal error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Problem generation failed" },
      { status: 500 }
    );
  }
}
