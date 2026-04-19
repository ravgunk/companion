"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn(
        "font-mono text-[15px] font-medium tracking-tight select-none",
        "text-[var(--text-primary)]",
        className
      )}
    >
      companion
      <span
        className="inline-block w-[5px] h-[5px] rounded-full bg-[var(--accent)] ml-0.5 mb-[3px] animate-pulse-dot"
        aria-hidden="true"
      />
    </span>
  );
}
