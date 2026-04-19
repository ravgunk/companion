"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  attemptCount: number;
  onSend: (text: string) => void;
  onClear: () => void;
  chatInputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatPanel({
  messages,
  isLoading,
  error,
  attemptCount,
  onSend,
  onClear,
  chatInputRef,
}: ChatPanelProps) {
  return (
    <div className="flex h-full flex-col bg-[var(--bg-base)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-3 shrink-0">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
            Debug Assistant
          </h2>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 uppercase tracking-wide">
            Ask questions. Learn by discovering.
          </p>
        </div>
        {attemptCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
              attemptCount >= 3
                ? "border-[var(--error)]/30 bg-[var(--error)]/10 text-[var(--error)]"
                : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-tertiary)]"
            )}
          >
            Attempt {attemptCount}
          </motion.div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onSuggestion={onSend}
        />
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 border-t border-[var(--error)]/20 bg-[var(--error)]/5 px-4 py-2"
          >
            <AlertCircle size={12} className="text-[var(--error)] shrink-0" />
            <span className="flex-1 text-[12px] text-[var(--error)]">{error}</span>
            <button
              className="flex items-center gap-1 text-[11px] text-[var(--error)] hover:opacity-80 transition-opacity"
              onClick={() => onSend(messages[messages.length - 1]?.content ?? "")}
            >
              <RefreshCw size={11} />
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="shrink-0">
        <ChatInput
          onSend={onSend}
          onClear={onClear}
          disabled={isLoading}
          inputRef={chatInputRef}
        />
      </div>
    </div>
  );
}
