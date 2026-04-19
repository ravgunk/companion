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

function parseJSON(raw: string): ProblemsResult {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  return JSON.parse(cleaned) as ProblemsResult;
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
        content: `Language: ${language}\n\nDetected concepts:\n${conceptList}\n\nGenerate 3 graded practice problems.`,
      },
    ];

    let raw: string;
    try {
      raw = await callPollinations(messages);
    } catch {
      raw = await callPollinations(messages);
    }

    let result: ProblemsResult;
    try {
      result = parseJSON(raw);
    } catch {
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
    console.error("[generate-problems]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Problem generation failed" },
      { status: 500 }
    );
  }
}
