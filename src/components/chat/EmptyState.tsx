"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  onSuggestion: (text: string) => void;
}

const SUGGESTIONS = [
  "My loop isn't terminating correctly",
  "Getting an off-by-one error in binary search",
  "Recursive function hits stack overflow",
];

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12">
      <motion.div
        className="mb-6 flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-2 w-2 rounded-full bg-[var(--border-strong)]"
            animate={{
              y: [0, -6, 0],
              backgroundColor: ["var(--border-strong)", "var(--accent)", "var(--border-strong)"],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <p className="text-[14px] font-medium text-[var(--text-secondary)]">
          Paste your buggy code, describe what&apos;s wrong.
        </p>
        <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">
          I&apos;ll ask questions, not hand you the fix.
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-2 w-full max-w-[320px]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => onSuggestion(s)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2.5 text-left text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-all duration-150"
          >
            {s}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
