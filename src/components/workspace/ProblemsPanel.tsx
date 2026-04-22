"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lightbulb, AlertCircle, ListTodo, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Problem, ProblemsState } from "@/types";

interface ProblemsPanelProps {
  state: ProblemsState;
  onRetry?: () => void;
}

const LEVEL_STYLES: Record<Problem["level"], { badge: string; border: string }> = {
  Easy: {
    badge: "bg-green-500/10 text-[var(--success)] border border-green-500/20",
    border: "border-l-[var(--success)]",
  },
  Medium: {
    badge: "bg-yellow-500/10 text-[var(--warning)] border border-yellow-500/20",
    border: "border-l-[var(--warning)]",
  },
  Hard: {
    badge: "bg-red-500/10 text-[var(--error)] border border-red-500/20",
    border: "border-l-[var(--error)]",
  },
};

export function ProblemsPanel({ state, onRetry }: ProblemsPanelProps) {
  if (state.status === "idle") return <IdleState />;
  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.message} onRetry={onRetry} />;

  const { problems } = state.data;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      {(problems ?? []).map((problem, i) => (
        <motion.div
          key={problem.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
        >
          <ProblemCard problem={problem} />
        </motion.div>
      ))}
    </div>
  );
}

function ProblemCard({ problem }: { problem: Problem }) {
  const [expanded, setExpanded] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const styles = LEVEL_STYLES[problem.level];

  return (
    <div className={cn(
      "rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]",
      "border-l-2", styles.border,
      "hover:border-[var(--border-default)] transition-colors overflow-hidden"
    )}>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium", styles.badge)}>
          {problem.level}
        </span>
        <span className="flex-1 text-[13px] font-medium text-[var(--text-primary)]">
          {problem.title}
        </span>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} className="text-[var(--text-tertiary)]" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-[var(--border-subtle)] pt-3">
              <p className="text-[13px] leading-[20px] text-[var(--text-secondary)]">
                {problem.statement}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <FormatBlock label="Input" content={problem.inputFormat} />
                <FormatBlock label="Output" content={problem.outputFormat} />
              </div>

              {(problem.constraints ?? []).length > 0 && (
                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-[var(--text-disabled)]">
                    Constraints
                  </p>
                  <ul className="space-y-1">
                    {(problem.constraints ?? []).map((c, i) => (
                      <li key={i} className="font-mono text-[12px] text-[var(--text-secondary)]">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(problem.examples ?? []).map((ex, i) => (
                <div key={i}>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-[var(--text-disabled)]">
                    Example {i + 1}
                  </p>
                  <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] p-3 font-mono text-[12px] space-y-1">
                    <div><span className="text-[var(--text-tertiary)]">Input: </span><span className="text-[var(--text-secondary)]">{ex.input}</span></div>
                    <div><span className="text-[var(--text-tertiary)]">Output: </span><span className="text-[var(--text-secondary)]">{ex.output}</span></div>
                    {ex.explanation && (
                      <div className="pt-1 text-[var(--text-tertiary)] not-italic">{ex.explanation}</div>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between">
                <span className={cn(
                  "font-mono text-[12px] px-2 py-0.5 rounded",
                  "bg-[var(--bg-elevated)] text-[var(--text-tertiary)]"
                )}>
                  Expected: {problem.expectedComplexity}
                </span>
                <button
                  onClick={() => setHintVisible((v) => !v)}
                  className="flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
                >
                  <Lightbulb size={12} />
                  {hintVisible ? "Hide hint" : "Reveal hint"}
                </button>
              </div>

              <AnimatePresence>
                {hintVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "rounded-md border border-[var(--accent)]/20 bg-[var(--accent-muted)] p-3",
                      "text-[13px] text-[var(--text-secondary)]"
                    )}
                  >
                    <span className="text-[var(--accent)] font-medium">Hint: </span>
                    {problem.hint}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormatBlock({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium uppercase tracking-widest text-[var(--text-disabled)]">
        {label}
      </p>
      <p className="text-[12px] text-[var(--text-secondary)]">{content}</p>
    </div>
  );
}

function IdleState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
        <ListTodo size={22} className="text-[var(--text-tertiary)]" />
      </div>
      <div>
        <p className="text-[13px] font-medium text-[var(--text-secondary)]">No problems yet</p>
        <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">
          Click Generate Problems to get graded practice
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-4 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="shimmer h-5 w-12 rounded" />
            <div className="shimmer h-4 flex-1 rounded" />
          </div>
          <div className="shimmer h-3 w-full rounded" />
          <div className="shimmer h-3 w-3/4 rounded" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="rounded-xl border border-[var(--error)]/20 bg-[var(--error)]/5 p-4">
        <AlertCircle size={22} className="text-[var(--error)]" />
      </div>
      <div>
        <p className="text-[13px] font-medium text-[var(--text-primary)]">Generation failed</p>
        <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-md border border-[var(--border-default)] px-3 py-1.5 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
        >
          <RefreshCw size={12} />
          Try again
        </button>
      )}
    </div>
  );
}
