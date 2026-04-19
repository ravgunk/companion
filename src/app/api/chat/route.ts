import { NextRequest, NextResponse } from "next/server";
import { SOCRATIC_DEBUGGER_PROMPT } from "@/lib/prompts";
import type { ChatMessage } from "@/types";

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

    let reply: string;
    try {
      reply = await callPollinations(pollinationsMessages);
    } catch {
      reply = await callPollinations(pollinationsMessages);
    }

    return NextResponse.json({ reply: reply.trim(), attemptCount });
  } catch (err) {
    console.error("[chat]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat failed" },
      { status: 500 }
    );
  }
}
