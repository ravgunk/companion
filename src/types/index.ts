export type Language =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "go"
  | "rust"
  | "c";

export interface LanguageOption {
  value: Language;
  label: string;
  extension: string;
}

export interface Concept {
  name: string;
  category: "control-flow" | "data-structure" | "algorithm" | "paradigm" | "syntax";
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface AnalysisResult {
  language: string;
  concepts: Concept[];
  summary: string;
  complexity: {
    time: string;
    space: string;
  };
  qualityNotes: string[];
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: "reinforce" | "extend" | "challenge";
  level: "Easy" | "Medium" | "Hard";
  title: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: ProblemExample[];
  hint: string;
  expectedComplexity: string;
}

export interface ProblemsResult {
  problems: Problem[];
}

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export type AnalysisState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: AnalysisResult }
  | { status: "error"; message: string };

export type ProblemsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: ProblemsResult }
  | { status: "error"; message: string };

export interface AppSession {
  code: string;
  language: Language;
  messages: ChatMessage[];
  attemptCount: number;
  notes: string;
  onboarded: boolean;
}
