import { NextRequest, NextResponse } from "next/server";
import { CODE_ANALYZER_PROMPT } from "@/lib/prompts";
import { callPollinations, extractText, extractJSON } from "@/lib/pollinations";
import type { AnalysisResult } from "@/types";

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

    // Call Pollinations (retry once on network error)
    let raw: string;
    try {
      raw = await callPollinations(messages);
    } catch {
      raw = await callPollinations(messages);
    }

    console.log("[analyze] raw response (first 500 chars):", raw.slice(0, 500));

    // Extract the content string from whatever envelope Pollinations used
    const contentText = extractText(raw);

    // Pull the typed JSON out of the content string
    let result: AnalysisResult;
    try {
      result = extractJSON<AnalysisResult>(contentText, "analyze");
    } catch (parseErr) {
      console.warn("[analyze] first parse failed, retrying with explicit JSON prompt:", parseErr);
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
      result = extractJSON<AnalysisResult>(retryText, "analyze-retry");
    }

    console.log("[analyze] success — concepts:", result.concepts?.length ?? 0);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[analyze] fatal error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
