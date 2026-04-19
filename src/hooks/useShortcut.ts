"use client";

import { useEffect } from "react";

interface ShortcutOptions {
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export function useShortcut(
  key: string,
  callback: () => void,
  options: ShortcutOptions = {}
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (key === "?" && isInput) return;

      const metaMatch = options.meta ? (e.metaKey || e.ctrlKey) : true;
      const shiftMatch = options.shift ? e.shiftKey : !e.shiftKey || !options.shift;
      const altMatch = options.alt ? e.altKey : true;

      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        metaMatch &&
        (options.shift === undefined || e.shiftKey === options.shift) &&
        altMatch
      ) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, options.meta, options.shift, options.alt, options.ctrl]);
}
