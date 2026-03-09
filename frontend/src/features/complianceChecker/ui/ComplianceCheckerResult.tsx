"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useComplianceChecker } from "../hooks/useComplianceChecker";
import ResultView from "./ResultView";

export default function ComplianceCheckerResult() {
  const router = useRouter();
  const { status, state, error, runEvaluate, refresh } = useComplianceChecker();

  // On result page: ensure we have latest state; if not finished, evaluate once.
  useEffect(() => {
    if (status !== "ready") return;

    if (!state) return;

    if (state.status !== "finished") {
      void runEvaluate();
      return;
    }

    if (!state.result) {
      void refresh();
    }
  }, [status, state, runEvaluate, refresh]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
        <button
          className="mt-6 rounded-lg border px-4 py-2 text-sm"
          onClick={() => router.back()}
        >
          Zurück
        </button>
      </div>
    );
  }

  if (!state || status === "loading" || status === "evaluating") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm opacity-70">
        Lädt Ergebnis…
      </div>
    );
  }

  // If still no result, send back to wizard
  if (!state.result) {
    router.push("../complianceChecker");
    return null;
  }

  return <ResultView result={state.result} />;
}