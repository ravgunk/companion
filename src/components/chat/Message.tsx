"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface MessageProps {
  message: ChatMessage;
  index: number;
}

export function Message({ message, index }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={isUser
        ? { opacity: 0, x: 12 }
        : { opacity: 0, x: -12 }
      }
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 30,
        delay: index === 0 ? 0 : 0,
      }}
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {isUser ? (
        <UserMessage content={message.content} />
      ) : (
        <AssistantMessage content={message.content} />
      )}
    </motion.div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div
      className={cn(
        "max-w-[75%] rounded-lg border border-[var(--border-subtle)]",
        "bg-[var(--bg-elevated)] px-4 py-3",
        "text-[13px] leading-[20px] text-[var(--text-primary)]",
        "whitespace-pre-wrap break-words"
      )}
    >
      {content}
    </div>
  );
}

function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="relative flex w-full max-w-[680px] gap-3">
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-[var(--accent)] opacity-30"
        aria-hidden="true"
      />
      <div className="pl-4 flex-1 min-w-0">
        <div className="prose-companion text-[13px] leading-[20px] text-[var(--text-secondary)]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-[16px] font-semibold text-[var(--text-primary)] mt-4 mb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mt-3 mb-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-[13px] font-semibold text-[var(--text-primary)] mt-3 mb-1.5 uppercase tracking-wide">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-3 last:mb-0 text-[var(--text-secondary)]">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="mb-3 space-y-1 pl-4">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-3 space-y-1 pl-4 list-decimal">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-[var(--text-secondary)] before:content-['–'] before:mr-2 before:text-[var(--accent)] before:opacity-60">
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-[var(--accent)]/30 pl-3 text-[var(--text-secondary)] italic my-3">
                  {children}
                </blockquote>
              ),
              code({ className, children, ...props }) {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code
                      className="bg-[var(--accent-muted)] text-[var(--accent)] font-mono text-[12px] px-1.5 py-0.5 rounded"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }
                const lang = className?.replace("language-", "") ?? "";
                return (
                  <CodeBlock lang={lang}>{String(children).replace(/\n$/, "")}</CodeBlock>
                );
              },
              pre: ({ children }) => <>{children}</>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ children, lang }: { children: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-3 overflow-hidden rounded-md border border-[var(--border-default)] bg-[var(--bg-base)]">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-3 py-2">
        <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
          {lang || "code"}
        </span>
        <motion.button
          onClick={copy}
          whileTap={{ scale: 0.92 }}
          className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          aria-label="Copy code"
        >
          <motion.span
            key={copied ? "check" : "copy"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {copied ? <Check size={12} className="text-[var(--success)]" /> : <Copy size={12} />}
          </motion.span>
          {copied ? "Copied" : "Copy"}
        </motion.button>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-[12px] leading-[18px] text-[var(--text-primary)]">
          {children}
        </code>
      </pre>
    </div>
  );
}
