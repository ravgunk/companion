"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "@/lib/utils";
import { saveNotes } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface NotesPanelProps {
  initialValue?: string;
}

export function NotesPanel({ initialValue = "" }: NotesPanelProps) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistNotes = useCallback(
    debounce((text: string) => {
      saveNotes(text);
      setSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), 1500);
    }, 500),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setValue(v);
    persistNotes(v);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <div className="relative flex h-full flex-col">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Take notes here — thoughts, patterns, what you learned..."
        className={cn(
          "h-full w-full resize-none bg-transparent p-4",
          "font-mono text-[13px] leading-[20px] text-[var(--text-primary)]",
          "placeholder:text-[var(--text-disabled)]",
          "outline-none border-none",
          "focus:outline-none"
        )}
        spellCheck={false}
      />
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <span className="text-[11px] text-[var(--text-disabled)]">
          {value.length} chars
        </span>
        <AnimatePresence>
          {saved && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="text-[11px] text-[var(--success)]"
            >
              Saved
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
