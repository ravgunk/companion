import { NextRequest, NextResponse } from "next/server";
import { CODE_ANALYZER_PROMPT } from "@/lib/prompts";
import type { AnalysisResult } from "@/types";

async function callPollinations(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const res = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model: "openai", stream: false }),
  });
  if (!res.ok) throw new Error(`Pollinations error: ${res.status}`);
  const text = await res.text();
  return text;
}

function extractAnalysisResult(raw: string): AnalysisResult {
  let text = raw.trim();

  // Unwrap OpenAI-style envelope if present
  try {
    const envelope = JSON.parse(text) as Record<string, unknown>;
    const choices = envelope?.choices as Array<{ message?: { content?: string } }> | undefined;
    if (choices?.[0]?.message?.content) {
      text = choices[0].message.content;
    }
  } catch {}

  console.log("[analyze] raw Pollinations text (first 300 chars):", text.slice(0, 300));

  // Strategy 1: direct parse
  try {
    const parsed = JSON.parse(text) as AnalysisResult;
    if (parsed?.concepts) return parsed;
  } catch {}

  // Strategy 2: strip all markdown fences
  const noFences = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
  try {
    const parsed = JSON.parse(noFences) as AnalysisResult;
    if (parsed?.concepts) return parsed;
  } catch {}

  // Strategy 3: first { to last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    const parsed = JSON.parse(text.slice(start, end + 1)) as AnalysisResult;
    if (parsed?.concepts) return parsed;
  }

  throw new Error(`Could not extract valid JSON. First 200 chars: ${text.slice(0, 200)}`);
}

export async function POST(req: NextRequest) {
  try {
    const { code, language } = (await req.json()) as { code: string; language: string };

    if (!code?.trim()) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const messages = [
      { role: "system", content: CODE_ANALYZER_PROMPT },
      { role: "user", content: `Language hint: ${language}\n\nCode:\n\`\`\`\n${code}\n\`\`\`` },
    ];

    let raw: string;
    try {
      raw = await callPollinations(messages);
    } catch {
      // retry once
      raw = await callPollinations(messages);
    }

    let result: AnalysisResult;
    try {
      result = extractAnalysisResult(raw);
    } catch (parseErr) {
      console.warn("[analyze] first parse failed, retrying:", parseErr);
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
      result = extractAnalysisResult(retryRaw);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[analyze]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
