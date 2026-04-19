"use client";

import { useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: Language;
  editorRef?: React.MutableRefObject<unknown>;
}

const LANG_MAP: Record<Language, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  cpp: "cpp",
  go: "go",
  rust: "rust",
  c: "c",
};

export function CodeEditor({ value, onChange, language, editorRef }: CodeEditorProps) {
  const { theme } = useTheme();
  const internalRef = useRef<unknown>(null);

  const handleMount = useCallback(
    (editor: unknown, monaco: unknown) => {
      const m = monaco as {
        editor: {
          defineTheme: (name: string, data: unknown) => void;
          setTheme: (name: string) => void;
        };
      };

      import("@/lib/monaco-theme").then(({ COMPANION_DARK_THEME, COMPANION_LIGHT_THEME }) => {
        m.editor.defineTheme("companion-dark", COMPANION_DARK_THEME);
        m.editor.defineTheme("companion-light", COMPANION_LIGHT_THEME);
        m.editor.setTheme(theme === "dark" ? "companion-dark" : "companion-light");
      });

      if (editorRef) editorRef.current = editor;
      internalRef.current = editor;
    },
    [theme, editorRef]
  );

  return (
    <div className="relative h-full w-full overflow-hidden">
      {!value && (
        <div
          className="pointer-events-none absolute left-[68px] top-4 z-10 font-mono text-[13px] text-[var(--text-disabled)] select-none"
          aria-hidden="true"
        >
          {"// Paste or write your code here..."}
        </div>
      )}
      <MonacoEditor
        height="100%"
        language={LANG_MAP[language]}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        onMount={handleMount}
        theme={theme === "dark" ? "companion-dark" : "companion-light"}
        options={{
          minimap: { enabled: false },
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
          fontSize: 13,
          fontLigatures: true,
          lineHeight: 20,
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: "line",
          folding: true,
          wordWrap: "on",
          tabSize: 2,
          automaticLayout: true,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          scrollbar: {
            verticalScrollbarSize: 4,
            horizontalScrollbarSize: 4,
          },
        }}
      />
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="h-full w-full bg-[var(--bg-surface)] p-4">
      <div className="space-y-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="shimmer h-[13px] rounded"
            style={{ width: `${30 + Math.random() * 55}%`, opacity: 0.6 - i * 0.04 }}
          />
        ))}
      </div>
    </div>
  );
}
