"use client";

import { motion } from "framer-motion";
import { FileCode, Clock, Database, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisState, Concept } from "@/types";

interface AnalysisPanelProps {
  state: AnalysisState;
  onRetry?: () => void;
}

const CATEGORY_COLORS: Record<Concept["category"], string> = {
  "control-flow": "text-[var(--info)] bg-blue-500/10",
  "data-structure": "text-[var(--success)] bg-green-500/10",
  "algorithm": "text-[var(--accent)] bg-orange-500/10",
  "paradigm": "text-purple-400 bg-purple-500/10",
  "syntax": "text-[var(--text-secondary)] bg-[var(--bg-elevated)]",
};

const DIFFICULTY_DOT: Record<Concept["difficulty"], string> = {
  beginner: "bg-[var(--success)]",
  intermediate: "bg-[var(--warning)]",
  advanced: "bg-[var(--error)]",
};

export function AnalysisPanel({ state, onRetry }: AnalysisPanelProps) {
  if (state.status === "idle") return <IdleState />;
  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.message} onRetry={onRetry} />;

  const { data } = state;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-5">
      {/* Language */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2"
      >
        <span className={cn(
          "rounded-md px-2.5 py-1 text-[12px] font-medium font-mono",
          "bg-[var(--accent-muted)] text-[var(--accent)]",
          "border border-[var(--accent)]/20"
        )}>
          {data.language}
        </span>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <SectionLabel>Summary</SectionLabel>
        <p className="text-[13px] leading-[20px] text-[var(--text-secondary)]">{data.summary}</p>
      </motion.div>

      {/* Concepts */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SectionLabel>Concepts Detected</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {data.concepts.map((concept, i) => (
            <motion.div
              key={concept.name}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.12 + i * 0.04, type: "spring", stiffness: 400, damping: 25 }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium",
                CATEGORY_COLORS[concept.category]
              )}
            >
              <span
                className={cn("h-1.5 w-1.5 rounded-full shrink-0", DIFFICULTY_DOT[concept.difficulty])}
                title={concept.difficulty}
              />
              {concept.name}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Complexity */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.18 }}
      >
        <SectionLabel>Complexity</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <ComplexityCard icon={<Clock size={13} />} label="Time" value={data.complexity.time} />
          <ComplexityCard icon={<Database size={13} />} label="Space" value={data.complexity.space} />
        </div>
      </motion.div>

      {/* Quality Notes */}
      {data.qualityNotes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.22 }}
        >
          <SectionLabel>Quality Notes</SectionLabel>
          <ul className="space-y-1.5">
            {data.qualityNotes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)]">
                <AlertCircle size={12} className="mt-[3px] shrink-0 text-[var(--warning)]" />
                {note}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-[var(--text-disabled)]">
      {children}
    </p>
  );
}

function ComplexityCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className={cn(
      "rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3",
      "hover:border-[var(--border-default)] transition-colors"
    )}>
      <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-[var(--text-tertiary)]">
        {icon}
        {label}
      </div>
      <span className="font-mono text-[14px] font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function IdleState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
        <FileCode size={22} className="text-[var(--text-tertiary)]" />
      </div>
      <div>
        <p className="text-[13px] font-medium text-[var(--text-secondary)]">No analysis yet</p>
        <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">
          Paste code and click Analyze Code
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-4 space-y-5">
      <div className="flex gap-2">
        {[60, 90].map((w, i) => (
          <div key={i} className="shimmer h-6 rounded-md" style={{ width: w }} />
        ))}
      </div>
      <div className="space-y-2">
        <div className="shimmer h-3 w-16 rounded" />
        <div className="shimmer h-4 rounded" style={{ width: "90%" }} />
        <div className="shimmer h-4 rounded" style={{ width: "70%" }} />
      </div>
      <div className="space-y-2">
        <div className="shimmer h-3 w-24 rounded" />
        <div className="flex flex-wrap gap-2">
          {[80, 110, 95, 120, 75].map((w, i) => (
            <div key={i} className="shimmer h-6 rounded-md" style={{ width: w }} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="shimmer h-16 rounded-lg" />
        <div className="shimmer h-16 rounded-lg" />
      </div>
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
        <p className="text-[13px] font-medium text-[var(--text-primary)]">Analysis failed</p>
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
