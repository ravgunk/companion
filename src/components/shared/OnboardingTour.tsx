"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { markOnboarded } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description: string;
  position: "editor" | "chat" | "header";
}

const STEPS: Step[] = [
  {
    title: "Write or paste code here",
    description: "The editor supports all major languages with syntax highlighting and AI-powered analysis.",
    position: "editor",
  },
  {
    title: "Debug with guidance, not answers",
    description: "Ask about your code here. The assistant uses Socratic questioning to help you think through problems.",
    position: "chat",
  },
  {
    title: "Navigate with ⌘K",
    description: "Open the command palette to switch languages, analyze code, generate problems, and more.",
    position: "header",
  },
];

interface OnboardingTourProps {
  show: boolean;
  onDone: () => void;
}

export function OnboardingTour({ show, onDone }: OnboardingTourProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleDone();
    }
  };

  const handleDone = () => {
    markOnboarded();
    onDone();
  };

  if (!show) return null;

  const current = STEPS[step];

  const positionClasses: Record<Step["position"], string> = {
    editor: "bottom-8 left-8",
    chat: "bottom-8 right-8",
    header: "top-14 right-8",
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        className={cn(
          "fixed z-40 w-[280px] rounded-xl border border-[var(--border-default)]",
          "bg-[var(--bg-elevated)] p-4 shadow-md",
          positionClasses[current.position]
        )}
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex gap-1">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-all duration-200",
                      i === step
                        ? "w-4 bg-[var(--accent)]"
                        : "w-1 bg-[var(--border-strong)]"
                    )}
                  />
                ))}
              </div>
              <span className="text-[11px] text-[var(--text-disabled)]">
                {step + 1}/{STEPS.length}
              </span>
            </div>
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">
              {current.title}
            </p>
          </div>
          <button
            onClick={handleDone}
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
            aria-label="Skip onboarding"
          >
            <X size={12} />
          </button>
        </div>

        <p className="mb-4 text-[12px] leading-[18px] text-[var(--text-secondary)]">
          {current.description}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={handleDone}
            className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={handleNext}
            className={cn(
              "rounded-md px-3 py-1.5 text-[12px] font-medium",
              "bg-[var(--accent)] text-white",
              "hover:bg-[var(--accent-hover)] transition-colors"
            )}
          >
            {step < STEPS.length - 1 ? "Next" : "Get started"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
