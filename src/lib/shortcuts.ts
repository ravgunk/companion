export interface ShortcutDef {
  key: string;
  label: string;
  description: string;
  category: string;
}

export const SHORTCUTS: ShortcutDef[] = [
  { key: "⌘K", label: "⌘K", description: "Open command palette", category: "Navigation" },
  { key: "⌘↵", label: "⌘↵", description: "Send message", category: "Chat" },
  { key: "⌘/", label: "⌘/", description: "Analyze code", category: "Actions" },
  { key: "⌘G", label: "⌘G", description: "Generate problems", category: "Actions" },
  { key: "⌘L", label: "⌘L", description: "Focus editor", category: "Navigation" },
  { key: "⌘J", label: "⌘J", description: "Focus chat", category: "Navigation" },
  { key: "⌘⇧T", label: "⌘⇧T", description: "Toggle theme", category: "Settings" },
  { key: "?", label: "?", description: "Show shortcuts", category: "Help" },
  { key: "Esc", label: "Esc", description: "Close any overlay", category: "Navigation" },
];
