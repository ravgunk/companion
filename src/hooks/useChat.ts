"use client";

import { useState, useCallback } from "react";
import { sendChatMessage } from "@/lib/api";
import { generateId } from "@/lib/utils";
import { saveMessages, saveAttemptCount } from "@/lib/storage";
import type { ChatMessage } from "@/types";

export function useChat(initialMessages: ChatMessage[] = [], initialAttempt = 0) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [attemptCount, setAttemptCount] = useState(initialAttempt);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      const isStuck = content.trim().startsWith("/stuck");
      const newAttempt = isStuck ? attemptCount + 1 : attemptCount;

      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      saveMessages(nextMessages);
      setAttemptCount(newAttempt);
      saveAttemptCount(newAttempt);
      setIsLoading(true);
      setError(null);

      try {
        const { reply } = await sendChatMessage(nextMessages, newAttempt);
        const assistantMsg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: reply,
          timestamp: Date.now(),
        };
        const finalMessages = [...nextMessages, assistantMsg];
        setMessages(finalMessages);
        saveMessages(finalMessages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get response");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, attemptCount, isLoading]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setAttemptCount(0);
    setError(null);
    saveMessages([]);
    saveAttemptCount(0);
  }, []);

  return {
    messages,
    attemptCount,
    isLoading,
    error,
    sendMessage,
    clearChat,
    setMessages,
    setAttemptCount,
  };
}
