"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Zap,
  Code2,
  ListTodo,
  Trash2,
  RefreshCw,
  Globe,
  MessageSquare,
  FileCode,
  Keyboard,
  SunMoon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalyze: () => void;
  onGenerateProblems: () => void;
  onClearChat: () => void;
  onResetSession: () => void;
  onLanguageChange: (lang: Language) => void;
  onFocusEditor: () => void;
  onFocusChat: () => void;
  onShowShortcuts: () => void;
}

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "c", label: "C" },
];

export function CommandPalette({
  open,
  onOpenChange,
  onAnalyze,
  onGenerateProblems,
  onClearChat,
  onResetSession,
  onLanguageChange,
  onFocusEditor,
  onFocusChat,
  onShowShortcuts,
}: CommandPaletteProps) {
  const { setTheme, theme } = useTheme();

  const run = useCallback(
    (fn: () => void) => {
      onOpenChange(false);
      setTimeout(fn, 50);
    },
    [onOpenChange]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

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
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            key="palette"
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-[520px] -translate-x-1/2"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Command
              className={cn(
                "overflow-hidden rounded-xl border",
                "bg-[var(--bg-elevated)] border-[var(--border-default)]",
                "shadow-md"
              )}
            >
              <div className="flex items-center border-b border-[var(--border-subtle)] px-3">
                <Search size={14} className="mr-2 shrink-0 text-[var(--text-tertiary)]" />
                <Command.Input
                  className={cn(
                    "flex h-11 w-full bg-transparent py-3 text-[14px] outline-none",
                    "text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                  )}
                  placeholder="Type a command or search..."
                />
              </div>
              <Command.List className="max-h-[320px] overflow-y-auto p-1.5">
                <Command.Empty className="py-8 text-center text-[13px] text-[var(--text-tertiary)]">
                  No results found.
                </Command.Empty>

                <CommandGroup label="Actions">
                  <CommandItem icon={<Zap size={14} />} label="Analyze Code" shortcut="⌘/" onSelect={() => run(onAnalyze)} />
                  <CommandItem icon={<ListTodo size={14} />} label="Generate Problems" shortcut="⌘G" onSelect={() => run(onGenerateProblems)} />
                  <CommandItem icon={<Trash2 size={14} />} label="Clear Chat" onSelect={() => run(onClearChat)} />
                  <CommandItem icon={<RefreshCw size={14} />} label="Reset Session" onSelect={() => run(onResetSession)} />
                </CommandGroup>

                <Command.Separator className="my-1 h-px bg-[var(--border-subtle)]" />

                <CommandGroup label="Languages">
                  {LANGUAGES.map((l) => (
                    <CommandItem
                      key={l.value}
                      icon={<Code2 size={14} />}
                      label={`Switch to ${l.label}`}
                      onSelect={() => run(() => onLanguageChange(l.value))}
                    />
                  ))}
                </CommandGroup>

                <Command.Separator className="my-1 h-px bg-[var(--border-subtle)]" />

                <CommandGroup label="Navigation">
                  <CommandItem icon={<FileCode size={14} />} label="Focus Editor" shortcut="⌘L" onSelect={() => run(onFocusEditor)} />
                  <CommandItem icon={<MessageSquare size={14} />} label="Focus Chat" shortcut="⌘J" onSelect={() => run(onFocusChat)} />
                </CommandGroup>

                <Command.Separator className="my-1 h-px bg-[var(--border-subtle)]" />

                <CommandGroup label="Settings">
                  <CommandItem
                    icon={<SunMoon size={14} />}
                    label={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                    shortcut="⌘⇧T"
                    onSelect={() => run(() => setTheme(theme === "dark" ? "light" : "dark"))}
                  />
                  <CommandItem icon={<Keyboard size={14} />} label="View Shortcuts" shortcut="?" onSelect={() => run(onShowShortcuts)} />
                  <CommandItem icon={<Globe size={14} />} label="About companion." onSelect={() => onOpenChange(false)} />
                </CommandGroup>
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CommandGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={label}
      className={cn(
        "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5",
        "[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium",
        "[&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:uppercase",
        "[&_[cmdk-group-heading]]:text-[var(--text-disabled)]"
      )}
    >
      {children}
    </Command.Group>
  );
}

function CommandItem({
  icon,
  label,
  shortcut,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-[13px]",
        "text-[var(--text-secondary)] outline-none select-none",
        "data-[selected=true]:bg-[var(--accent-muted)] data-[selected=true]:text-[var(--text-primary)]",
        "transition-colors duration-100"
      )}
    >
      <span className="text-[var(--text-tertiary)] data-[selected=true]:text-[var(--accent)]">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {shortcut && (
        <kbd className="text-[11px] text-[var(--text-disabled)] font-mono">{shortcut}</kbd>
      )}
    </Command.Item>
  );
}
