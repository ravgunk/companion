"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Keyboard, GitFork, Settings } from "lucide-react";

import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { ShortcutsOverlay } from "@/components/shared/ShortcutsOverlay";
import { OnboardingTour } from "@/components/shared/OnboardingTour";

import { CodeEditor } from "@/components/workspace/CodeEditor";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { AnalysisPanel } from "@/components/workspace/AnalysisPanel";
import { ProblemsPanel } from "@/components/workspace/ProblemsPanel";
import { NotesPanel } from "@/components/workspace/NotesPanel";

import { ChatPanel } from "@/components/chat/ChatPanel";

import { useChat } from "@/hooks/useChat";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useShortcut } from "@/hooks/useShortcut";

import { loadSession, saveCode, saveLanguage, resetSession } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";

type WorkspaceTab = "analyze" | "problems" | "notes";

export default function Home() {
  // Start with SSR-safe defaults — localStorage is loaded after mount to prevent
  // hydration mismatch (React errors #422 / #425).
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("javascript");
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("analyze");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [initialNotes, setInitialNotes] = useState("");

  const editorRef = useRef<unknown>(null);
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);

  const { analysis, problems, runAnalysis, runGenerateProblems, resetAnalysis } = useAnalysis();
  const { messages, attemptCount, isLoading, error, sendMessage, clearChat, setMessages, setAttemptCount } = useChat(
    [],
    0
  );

  useEffect(() => {
    const session = loadSession();
    setCode(session.code);
    setLanguage(session.language);
    setShowOnboarding(!session.onboarded);
    setInitialNotes(session.notes);
    if (session.messages.length > 0) setMessages(session.messages);
    if (session.attemptCount > 0) setAttemptCount(session.attemptCount);
  // setMessages and setAttemptCount are stable setState callbacks — safe to omit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { setTheme, theme } = useTheme();

  const handleCodeChange = useCallback((v: string) => {
    setCode(v);
    saveCode(v);
  }, []);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    saveLanguage(lang);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!code.trim()) {
      toast.error("Paste some code first");
      return;
    }
    setActiveTab("analyze");
    runAnalysis(code, language);
  }, [code, language, runAnalysis]);

  const handleGenerateProblems = useCallback(() => {
    if (!code.trim()) {
      toast.error("Paste some code first");
      return;
    }
    setActiveTab("problems");
    runGenerateProblems(code, language);
  }, [code, language, runGenerateProblems]);

  const handleResetSession = useCallback(() => {
    resetSession();
    setCode("");
    setLanguage("javascript");
    clearChat();
    resetAnalysis();
    toast.success("Session reset");
  }, [clearChat, resetAnalysis]);

  const handleFocusEditor = useCallback(() => {
    const ed = editorRef.current as { focus?: () => void } | null;
    ed?.focus?.();
  }, []);

  const handleFocusChat = useCallback(() => {
    chatInputRef.current?.focus();
  }, []);

  useShortcut("/", handleAnalyze, { meta: true });
  useShortcut("g", handleGenerateProblems, { meta: true });
  useShortcut("l", handleFocusEditor, { meta: true });
  useShortcut("j", handleFocusChat, { meta: true });
  useShortcut("?", () => setShortcutsOpen(true));
  useShortcut("t", () => setTheme(theme === "dark" ? "light" : "dark"), { meta: true, shift: true });

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  };

  return (
    <motion.div
      className="flex h-screen flex-col overflow-hidden bg-[var(--bg-base)]"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Top Bar */}
      <motion.header
        variants={item}
        className="flex h-12 shrink-0 items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-base)] px-4"
      >
        <Logo />

        <div className="flex items-center gap-1 text-[12px] text-[var(--text-tertiary)]">
          <span className="mx-1 text-[var(--border-strong)]">/</span>
          <span>workspace</span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setPaletteOpen(true)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[12px] font-mono",
              "border-[var(--border-subtle)] bg-[var(--bg-subtle)]",
              "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]",
              "hover:border-[var(--border-default)] transition-colors"
            )}
            aria-label="Open command palette"
          >
            ⌘K
          </button>

          <button
            onClick={() => setShortcutsOpen(true)}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            aria-label="View keyboard shortcuts"
          >
            <Keyboard size={14} strokeWidth={1.5} />
          </button>

          <ThemeToggle />

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            aria-label="View on GitHub"
          >
            <GitFork size={14} strokeWidth={1.5} />
          </a>

          <button
            className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            aria-label="Settings"
          >
            <Settings size={14} strokeWidth={1.5} />
          </button>
        </div>
      </motion.header>

      {/* Main workspace */}
      <motion.main variants={item} className="flex-1 min-h-0">
        <PanelGroup orientation="horizontal" className="h-full">
          {/* Left pane: Editor + bottom tabs */}
          <Panel defaultSize={55} minSize={30} className="flex flex-col min-h-0">
            <WorkspaceHeader
              language={language}
              onLanguageChange={handleLanguageChange}
              onAnalyze={handleAnalyze}
              onGenerateProblems={handleGenerateProblems}
              isAnalyzing={analysis.status === "loading"}
              isGenerating={problems.status === "loading"}
            />

            <PanelGroup orientation="vertical" className="flex-1 min-h-0">
              <Panel defaultSize={55} minSize={20}>
                <div className="h-full border-b border-[var(--border-subtle)]">
                  <CodeEditor
                    value={code}
                    onChange={handleCodeChange}
                    language={language}
                    editorRef={editorRef as React.MutableRefObject<unknown>}
                  />
                </div>
              </Panel>

              <PanelResizeHandle className="h-px bg-[var(--border-subtle)] hover:bg-[var(--accent)]/60 transition-colors cursor-row-resize" />

              <Panel defaultSize={45} minSize={20} className="flex flex-col min-h-0">
                {/* Tab bar */}
                <div className="flex items-center gap-0 border-b border-[var(--border-subtle)] px-4 shrink-0">
                  {(["analyze", "problems", "notes"] as WorkspaceTab[]).map((tab) => {
                    const label = tab === "analyze" ? "Analysis" : tab === "problems" ? "Problems" : "Notes";
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "relative px-3 py-2.5 text-[12px] font-medium transition-colors",
                          activeTab === tab
                            ? "text-[var(--text-primary)]"
                            : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                        )}
                      >
                        {label}
                        {activeTab === tab && (
                          <motion.div
                            layoutId="tab-underline"
                            className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[var(--accent)]"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  {activeTab === "analyze" && (
                    <AnalysisPanel state={analysis} onRetry={() => runAnalysis(code, language)} />
                  )}
                  {activeTab === "problems" && (
                    <ProblemsPanel state={problems} onRetry={() => runGenerateProblems(code, language)} />
                  )}
                  {activeTab === "notes" && (
                    <NotesPanel initialValue={initialNotes} />
                  )}
                </div>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-px bg-[var(--border-subtle)] hover:bg-[var(--accent)]/60 transition-colors cursor-col-resize" />

          {/* Right pane: Chat */}
          <Panel defaultSize={45} minSize={25}>
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              error={error}
              attemptCount={attemptCount}
              onSend={sendMessage}
              onClear={clearChat}
              chatInputRef={chatInputRef}
            />
          </Panel>
        </PanelGroup>
      </motion.main>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onAnalyze={handleAnalyze}
        onGenerateProblems={handleGenerateProblems}
        onClearChat={clearChat}
        onResetSession={handleResetSession}
        onLanguageChange={handleLanguageChange}
        onFocusEditor={handleFocusEditor}
        onFocusChat={handleFocusChat}
        onShowShortcuts={() => setShortcutsOpen(true)}
      />

      <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      <OnboardingTour show={showOnboarding} onDone={() => setShowOnboarding(false)} />
    </motion.div>
  );
}
