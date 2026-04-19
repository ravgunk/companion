"use client";

import { useEffect, useRef } from "react";
import { Message } from "./Message";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "./EmptyState";
import type { ChatMessage } from "@/types";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSuggestion: (text: string) => void;
}

export function MessageList({ messages, isLoading, onSuggestion }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return <EmptyState onSuggestion={onSuggestion} />;
  }

  return (
    <div className="h-full overflow-y-auto px-5 py-5">
      <div className="mx-auto max-w-[720px] space-y-6">
        {messages.map((msg, i) => (
          <Message key={msg.id} message={msg} index={i} />
        ))}
        {isLoading && (
          <div className="pl-4 border-l-[3px] border-[var(--accent)]/30">
            <TypingIndicator />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
