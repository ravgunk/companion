import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function looksLikeCode(text: string): boolean {
  const lines = text.split("\n");
  if (lines.length < 3) return false;
  const codePatterns = [
    /^\s*(def |class |import |from |function |const |let |var |if |for |while )/,
    /[{};]\s*$/,
    /^\s*(#|\/\/|\/\*)/,
    /=>/,
    /\(\s*\)\s*[:{]/,
  ];
  const matches = lines.filter((l) => codePatterns.some((p) => p.test(l)));
  return matches.length >= 2;
}

export function detectLanguageFromCode(code: string): string {
  if (/def |import |print\(|:\s*$/.test(code)) return "python";
  if (/#include|cout|cin|int main/.test(code)) return "cpp";
  if (/public class|System\.out/.test(code)) return "java";
  if (/fn |let mut|println!/.test(code)) return "rust";
  if (/func |fmt\.|package main/.test(code)) return "go";
  if (/interface |type |: string|: number/.test(code)) return "typescript";
  return "javascript";
}
