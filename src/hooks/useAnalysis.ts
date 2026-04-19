"use client";

import { useState } from "react";
import { analyzeCode, generateProblems } from "@/lib/api";
import type { AnalysisState, ProblemsState, Language } from "@/types";

export function useAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: "idle" });
  const [problems, setProblems] = useState<ProblemsState>({ status: "idle" });

  async function runAnalysis(code: string, language: Language) {
    if (!code.trim()) return;
    setAnalysis({ status: "loading" });
    try {
      const data = await analyzeCode(code, language);
      setAnalysis({ status: "success", data });
    } catch (err) {
      setAnalysis({
        status: "error",
        message: err instanceof Error ? err.message : "Analysis failed",
      });
    }
  }

  async function runGenerateProblems(code: string, language: Language) {
    if (analysis.status !== "success" && !code.trim()) return;

    let concepts =
      analysis.status === "success" ? analysis.data.concepts : [];

    if (concepts.length === 0) {
      setAnalysis({ status: "loading" });
      try {
        const data = await analyzeCode(code, language);
        setAnalysis({ status: "success", data });
        concepts = data.concepts;
      } catch (err) {
        setAnalysis({
          status: "error",
          message: err instanceof Error ? err.message : "Analysis failed",
        });
        return;
      }
    }

    setProblems({ status: "loading" });
    try {
      const data = await generateProblems(concepts, language);
      setProblems({ status: "success", data });
    } catch (err) {
      setProblems({
        status: "error",
        message: err instanceof Error ? err.message : "Problem generation failed",
      });
    }
  }

  function resetAnalysis() {
    setAnalysis({ status: "idle" });
    setProblems({ status: "idle" });
  }

  return { analysis, problems, runAnalysis, runGenerateProblems, resetAnalysis };
}
