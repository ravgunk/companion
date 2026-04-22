import { NextRequest, NextResponse } from "next/server";
import { SOCRATIC_DEBUGGER_PROMPT } from "@/lib/prompts";
import { callPollinations, extractText } from "@/lib/pollinations";
import type { ChatMessage } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { messages, attemptCount } = (await req.json()) as {
      messages: ChatMessage[];
      attemptCount: number;
    };

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    let systemPrompt = SOCRATIC_DEBUGGER_PROMPT;
    if (attemptCount >= 3) {
      systemPrompt +=
        "\n\nThe student has signaled they are stuck multiple times. You may now provide direct guidance with corrected code and a detailed root-cause explanation.";
    }

    const pollinationsMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // Call Pollinations (retry once on network error)
    let raw: string;
    try {
      raw = await callPollinations(pollinationsMessages);
    } catch {
      raw = await callPollinations(pollinationsMessages);
    }

    console.log("[chat] raw response (first 300 chars):", raw.slice(0, 300));

    // extractText handles reasoning_content, choices, content, and plain-text responses
    const reply = extractText(raw).trim();

    return NextResponse.json({ reply, attemptCount });
  } catch (err) {
    console.error("[chat] fatal error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat failed" },
      { status: 500 }
    );
  }
}
