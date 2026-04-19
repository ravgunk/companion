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

function parseJSON(raw: string): AnalysisResult {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  return JSON.parse(cleaned) as AnalysisResult;
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
      result = parseJSON(raw);
    } catch {
      // ask model to return clean JSON
      const retryMessages = [
        ...messages,
        { role: "assistant", content: raw },
        { role: "user", content: "Return only the JSON object, no markdown fences, no prose." },
      ];
      const retryRaw = await callPollinations(retryMessages);
      result = parseJSON(retryRaw);
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
