"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, ListTodo, Loader2 } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";

interface WorkspaceHeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onAnalyze: () => void;
  onGenerateProblems: () => void;
  isAnalyzing: boolean;
  isGenerating: boolean;
}

export function WorkspaceHeader({
  language,
  onLanguageChange,
  onAnalyze,
  onGenerateProblems,
  isAnalyzing,
  isGenerating,
}: WorkspaceHeaderProps) {
  const [fileName, setFileName] = useState("untitled");
  const [editingName, setEditingName] = useState(false);

  const ext: Record<Language, string> = {
    javascript: ".js", typescript: ".ts", python: ".py",
    java: ".java", cpp: ".cpp", go: ".go", rust: ".rs", c: ".c",
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border-subtle)]">
      <LanguageSelector value={language} onChange={onLanguageChange} />

      <div className="flex items-center gap-1 text-[13px] text-[var(--text-tertiary)]">
        {editingName ? (
          <input
            autoFocus
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
            className={cn(
              "bg-transparent border-b border-[var(--border-focus)] outline-none",
              "text-[13px] text-[var(--text-primary)] font-mono w-28"
            )}
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="font-mono hover:text-[var(--text-primary)] transition-colors"
          >
            {fileName}{ext[language]}
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <motion.button
          onClick={onGenerateProblems}
          disabled={isGenerating || isAnalyzing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-medium",
            "border-[var(--border-default)] bg-[var(--bg-surface)]",
            "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            "hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]",
            "transition-all duration-150",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isGenerating ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <ListTodo size={13} />
          )}
          Generate Problems
        </motion.button>

        <motion.button
          onClick={onAnalyze}
          disabled={isAnalyzing || isGenerating}
          whileHover={{ scale: 1.02, boxShadow: "0 0 16px rgba(255,107,53,0.2)" }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium",
            "bg-[var(--accent)] text-white",
            "hover:bg-[var(--accent-hover)] transition-all duration-150",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isAnalyzing ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Zap size={13} />
          )}
          Analyze Code
        </motion.button>
      </div>
    </div>
  );
}
