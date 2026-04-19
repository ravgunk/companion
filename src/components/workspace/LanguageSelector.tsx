"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Language, LanguageOption } from "@/types";

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "javascript", label: "JavaScript", extension: ".js" },
  { value: "typescript", label: "TypeScript", extension: ".ts" },
  { value: "python", label: "Python", extension: ".py" },
  { value: "java", label: "Java", extension: ".java" },
  { value: "cpp", label: "C++", extension: ".cpp" },
  { value: "go", label: "Go", extension: ".go" },
  { value: "rust", label: "Rust", extension: ".rs" },
  { value: "c", label: "C", extension: ".c" },
];

interface LanguageSelectorProps {
  value: Language;
  onChange: (lang: Language) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGE_OPTIONS.find((l) => l.value === value) ?? LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[13px]",
          "border-[var(--border-default)] bg-[var(--bg-surface)]",
          "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
          "hover:border-[var(--border-strong)] transition-all duration-150",
          open && "border-[var(--border-focus)] text-[var(--text-primary)]"
        )}
      >
        <span className="font-mono text-[11px] text-[var(--accent)] opacity-70">
          {current.extension}
        </span>
        <span>{current.label}</span>
        <ChevronDown
          size={12}
          className={cn("transition-transform duration-150 text-[var(--text-tertiary)]", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={cn(
              "absolute top-full left-0 z-30 mt-1 w-[160px] overflow-hidden",
              "rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-md py-1"
            )}
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-1.5 text-[13px]",
                  "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                  "hover:bg-[var(--bg-surface)] transition-colors duration-100",
                  value === opt.value && "text-[var(--text-primary)]"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[var(--text-tertiary)] w-7">
                    {opt.extension}
                  </span>
                  <span>{opt.label}</span>
                </div>
                {value === opt.value && (
                  <Check size={12} className="text-[var(--accent)]" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { LANGUAGE_OPTIONS };
