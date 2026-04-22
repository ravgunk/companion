import { NextRequest, NextResponse } from "next/server";
import { PROBLEM_GENERATOR_PROMPT } from "@/lib/prompts";
import { callPollinations, extractText, extractJSON } from "@/lib/pollinations";
import type { Concept, ProblemsResult } from "@/types";

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
        content: `Language: ${language}\n\nDetected concepts:\n${conceptList}\n\nGenerate 3 graded practice problems. Return ONLY the JSON object, no markdown, no prose. Start with { and end with }.`,
      },
    ];

    // Call Pollinations (retry once on network error)
    let raw: string;
    try {
      raw = await callPollinations(messages);
    } catch {
      raw = await callPollinations(messages);
    }

    console.log("[generate-problems] raw response (first 500 chars):", raw.slice(0, 500));

    // Extract the content string from whatever envelope Pollinations used
    const contentText = extractText(raw);

    // Pull the typed JSON out of the content string
    let result: ProblemsResult;
    try {
      result = extractJSON<ProblemsResult>(contentText, "generate-problems");
    } catch (parseErr) {
      console.warn("[generate-problems] first parse failed, retrying with explicit JSON prompt:", parseErr);
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
      const retryText = extractText(retryRaw);
      result = extractJSON<ProblemsResult>(retryText, "generate-problems-retry");
    }

    // Guarantee problems array exists even if model returned partial shape
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
