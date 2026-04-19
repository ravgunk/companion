"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { SHORTCUTS } from "@/lib/shortcuts";
import { cn } from "@/lib/utils";

interface ShortcutsOverlayProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = ["Navigation", "Chat", "Actions", "Settings", "Help"];

export function ShortcutsOverlay({ open, onClose }: ShortcutsOverlayProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 frosted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <motion.div
            key="overlay"
            className={cn(
              "fixed left-1/2 top-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2",
              "rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-md"
            )}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
                  Keyboard shortcuts
                </h2>
                <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">
                  Navigate faster with your keyboard
                </p>
              </div>
              <button
                onClick={onClose}
                className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center",
                  "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]",
                  "hover:bg-[var(--bg-surface)] transition-colors"
                )}
                aria-label="Close shortcuts overlay"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {CATEGORIES.map((cat) => {
                const items = SHORTCUTS.filter((s) => s.category === cat);
                if (!items.length) return null;
                return (
                  <div key={cat}>
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-[var(--text-disabled)]">
                      {cat}
                    </p>
                    <div className="space-y-1">
                      {items.map((s) => (
                        <div
                          key={s.key}
                          className="flex items-center justify-between py-1.5"
                        >
                          <span className="text-[13px] text-[var(--text-secondary)]">
                            {s.description}
                          </span>
                          <KeyBadge shortcut={s.label} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function KeyBadge({ shortcut }: { shortcut: string }) {
  const keys = shortcut.split("").reduce<string[]>((acc, char) => {
    if (char === "⌘") acc.push("⌘");
    else if (char === "⇧") acc.push("⇧");
    else if (char === "↵") acc.push("↵");
    else if (acc.length && !["⌘", "⇧"].includes(acc[acc.length - 1])) {
      acc[acc.length - 1] += char;
    } else {
      acc.push(char);
    }
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-0.5">
      {keys.map((k, i) => (
        <kbd
          key={i}
          className={cn(
            "inline-flex items-center justify-center rounded px-1.5 py-0.5",
            "bg-[var(--bg-surface)] border border-[var(--border-default)]",
            "text-[11px] font-mono text-[var(--text-secondary)]",
            "min-w-[20px] h-[20px]"
          )}
        >
          {k}
        </kbd>
      ))}
    </div>
  );
}
