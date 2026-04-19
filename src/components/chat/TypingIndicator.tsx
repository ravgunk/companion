"use client";

import { cn } from "@/lib/utils";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-[5px] w-[5px] rounded-full bg-[var(--accent)] animate-typing"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className={cn(
        "text-[12px] text-[var(--text-tertiary)]",
        "after:content-[''] after:animate-[ellipsis_1.4s_infinite]"
      )}>
        Thinking
        <span className="inline-block overflow-hidden w-4 text-left align-bottom">
          <span className="animate-pulse">...</span>
        </span>
      </span>
    </div>
  );
}
