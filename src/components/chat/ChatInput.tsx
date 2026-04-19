"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Slash } from "lucide-react";
import { cn, looksLikeCode } from "@/lib/utils";

interface SlashCommand {
  cmd: string;
  description: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { cmd: "/explain", description: "Ask for conceptual explanation" },
  { cmd: "/hint", description: "Request a hint" },
  { cmd: "/stuck", description: "Signal you are stuck" },
  { cmd: "/clear", description: "Clear conversation" },
];

interface ChatInputProps {
  onSend: (text: string) => void;
  onClear: () => void;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({ onSend, onClear, disabled, inputRef }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [showSlash, setShowSlash] = useState(false);
  const [slashFilter, setSlashFilter] = useState("");
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const ref = inputRef ?? internalRef;

  const filteredCommands = SLASH_COMMANDS.filter((c) =>
    c.cmd.includes(slashFilter.toLowerCase())
  );

  const send = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    if (trimmed === "/clear") { onClear(); setValue(""); return; }
    onSend(trimmed);
    setValue("");
    setShowSlash(false);
  }, [value, disabled, onSend, onClear]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      send();
      return;
    }
    if (e.key === "Escape") {
      setShowSlash(false);
      return;
    }
    if (e.key === "Enter" && showSlash && filteredCommands.length > 0) {
      e.preventDefault();
      applyCommand(filteredCommands[0].cmd);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setValue(v);

    if (v.startsWith("/")) {
      setShowSlash(true);
      setSlashFilter(v.slice(1));
    } else {
      setShowSlash(false);
    }

    // auto-grow
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (looksLikeCode(pasted)) {
      e.preventDefault();
      const wrapped = "```\n" + pasted + "\n```";
      setValue((prev) => prev + wrapped);
    }
  };

  const applyCommand = (cmd: string) => {
    setValue(cmd + " ");
    setShowSlash(false);
    ref.current?.focus();
  };

  return (
    <div className="relative px-4 py-3 border-t border-[var(--border-subtle)]">
      <AnimatePresence>
        {showSlash && filteredCommands.length > 0 && (
          <motion.div
            className={cn(
              "absolute bottom-full left-4 right-4 mb-1 overflow-hidden",
              "rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-md py-1"
            )}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {filteredCommands.map((c) => (
              <button
                key={c.cmd}
                onClick={() => applyCommand(c.cmd)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[var(--bg-surface)] transition-colors"
              >
                <span className="font-mono text-[13px] text-[var(--accent)]">{c.cmd}</span>
                <span className="text-[12px] text-[var(--text-tertiary)]">{c.description}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "flex items-end gap-2 rounded-lg border bg-[var(--bg-surface)] px-3 py-2.5",
        "transition-all duration-150",
        value
          ? "border-[var(--border-focus)]"
          : "border-[var(--border-default)]"
      )}>
        <Slash size={13} className="mb-1 shrink-0 text-[var(--text-disabled)]" />
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
          rows={1}
          placeholder="Describe the bug or paste code..."
          className={cn(
            "flex-1 resize-none bg-transparent text-[13px] leading-[20px]",
            "text-[var(--text-primary)] placeholder:text-[var(--text-disabled)]",
            "outline-none border-none max-h-[180px] overflow-y-auto"
          )}
          style={{ height: "20px" }}
        />
        <div className="flex items-center gap-2 shrink-0 mb-0.5">
          <span className="hidden sm:block text-[11px] text-[var(--text-disabled)] font-mono">⌘↵</span>
          <motion.button
            onClick={send}
            disabled={!value.trim() || disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md transition-all",
              value.trim() && !disabled
                ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                : "bg-[var(--bg-elevated)] text-[var(--text-disabled)]"
            )}
            aria-label="Send message"
          >
            <ArrowUp size={13} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
