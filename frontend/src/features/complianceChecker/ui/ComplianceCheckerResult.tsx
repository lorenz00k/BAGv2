"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useComplianceChecker } from "../hooks/useComplianceChecker";
import ResultView from "./ResultView";

export default function ComplianceCheckerResult() {
  const router = useRouter();
  const [isRestarting, setIsRestarting] = useState(false);

  const { status, state, error, refresh, restart } = useComplianceChecker();

  useEffect(() => {
    if (isRestarting) return;
    if (status !== "ready") return;
    if (!state) return;

    if (state.status !== "finished") {
      router.replace("/complianceChecker");
      return;
    }

    if (!state.result) {
      void refresh();
    }
  }, [isRestarting, status, state, refresh, router]);

  useEffect(() => {
    if (isRestarting) return;
    if (status !== "ready") return;
    if (!state) return;
    if (state.status !== "finished") return;
    if (state.result) return;

    router.replace("/complianceChecker");
  }, [isRestarting, status, state, router]);

  async function handleRestart() {
    setIsRestarting(true);
    try {
      await restart();
      router.replace("/complianceChecker");
    } finally {
      setIsRestarting(false);
    }
  }

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

  if (!state || status === "loading" || status === "evaluating" || isRestarting) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm opacity-70">
        Lädt Ergebnis…
      </div>
    );
  }

  if (!state.result) {
    return null;
  }

  return (
    <ResultView
      result={state.result}
      onRestart={handleRestart}
      restartDisabled={isRestarting}
    />
  );
}